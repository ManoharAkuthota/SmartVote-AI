package com.smartvote.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.smartvote.entity.FaceEmbedding;
import com.smartvote.entity.User;

import java.util.List;
import java.util.Optional;

@Service
public class FaceService {

    private static final Logger log = LoggerFactory.getLogger(FaceService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Standard FaceNet/dlib/face-api.js threshold:
     * - Same person: Euclidean distance is typically 0.15 - 0.45 (strictly <= 0.55)
     * - Different person: Euclidean distance is typically 0.65 - 1.25 (strictly > 0.55)
     */
    @Value("${app.face.max-distance:0.60}")
    private double maxDistanceThreshold;

    /**
     * Raw Cosine Similarity threshold (uncompressed):
     * - Same person: Raw cosine is typically 0.82 - 0.99 (strictly >= 0.78)
     * - Different person: Raw cosine is typically 0.20 - 0.72 (strictly < 0.78)
     */
    @Value("${app.face.similarity-threshold:0.78}")
    private double minCosineThreshold;

    /**
     * Calculates Euclidean Distance between two 128-dimensional embedding vectors.
     * d = sqrt(sum((a_i - b_i)^2))
     */
    public double calculateEuclideanDistance(double[] vectorA, double[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length == 0 || vectorB.length == 0) {
            return Double.MAX_VALUE;
        }

        if (vectorA.length != vectorB.length) {
            log.warn("Vector length mismatch: {} vs {}", vectorA.length, vectorB.length);
            return Double.MAX_VALUE;
        }

        double sumSq = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            double diff = vectorA[i] - vectorB[i];
            sumSq += diff * diff;
        }

        return Math.sqrt(sumSq);
    }

    /**
     * Calculates uncompressed RAW Cosine Similarity between two 128-dimensional vectors.
     * Cosine = (A . B) / (||A|| * ||B||)
     * Value range: -1.0 to +1.0
     */
    public double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length == 0 || vectorB.length == 0) {
            return 0.0;
        }

        if (vectorA.length != vectorB.length) {
            log.warn("Vector length mismatch: {} vs {}", vectorA.length, vectorB.length);
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    public boolean isMatch(String storedEmbeddingJson, List<Double> liveEmbedding) {
        return isMatch(storedEmbeddingJson, liveEmbedding, this.maxDistanceThreshold, this.minCosineThreshold);
    }

    public boolean isMatch(String storedEmbeddingJson, List<Double> liveEmbedding, double maxDistance, double minCosine) {
        if (storedEmbeddingJson == null || storedEmbeddingJson.isBlank() || liveEmbedding == null || liveEmbedding.isEmpty()) {
            return false;
        }

        try {
            List<Double> storedList = objectMapper.readValue(storedEmbeddingJson, new TypeReference<List<Double>>() {});
            if (storedList.size() != liveEmbedding.size()) {
                log.warn("Stored embedding size ({}) != live embedding size ({})", storedList.size(), liveEmbedding.size());
                return false;
            }

            double[] vecA = storedList.stream().mapToDouble(Double::doubleValue).toArray();
            double[] vecB = liveEmbedding.stream().mapToDouble(Double::doubleValue).toArray();

            double distance = calculateEuclideanDistance(vecA, vecB);
            double rawCosine = calculateCosineSimilarity(vecA, vecB);

            // DUAL VERIFICATION:
            // 1. Euclidean distance must be <= maxDistance (0.55)
            // 2. Raw cosine similarity must be >= minCosine (0.85)
            boolean distanceMatch = distance <= maxDistance;
            boolean cosineMatch = rawCosine >= minCosine;
            boolean match = distanceMatch && cosineMatch;

            log.info("Facial Security Verification -> Euclidean Distance: {} (Max Allowed: {}), Raw Cosine: {} (Min Required: {}) -> RESULT: {}",
                    String.format("%.4f", distance),
                    String.format("%.4f", maxDistance),
                    String.format("%.4f", rawCosine),
                    String.format("%.4f", minCosine),
                    match ? "MATCH CONFIRMED (SAME PERSON)" : "MISMATCH REJECTED (DIFFERENT PERSON)");

            return match;
        } catch (Exception e) {
            log.error("Failed to parse and compare face embeddings: {}", e.getMessage());
            return false;
        }
    }

    public String serializeEmbedding(List<Double> embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize face embedding: " + e.getMessage());
        }
    }

    public List<Double> deserializeEmbedding(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Double>>() {});
        } catch (Exception e) {
            log.error("Error deserializing face embedding: {}", e.getMessage());
            return List.of();
        }
    }

    public double getSimilarityThreshold() {
        return minCosineThreshold;
    }

    public double getMaxDistanceThreshold() {
        return maxDistanceThreshold;
    }

    /**
     * Checks a live embedding against a collection of enrolled database face embeddings.
     * Returns the matching User if found, optionally excluding a specific user ID.
     */
    public Optional<User> findMatchingUserInDatabase(List<Double> liveEmbedding, List<FaceEmbedding> allEmbeddings, Long excludeUserId) {
        if (liveEmbedding == null || liveEmbedding.isEmpty() || allEmbeddings == null || allEmbeddings.isEmpty()) {
            return Optional.empty();
        }

        for (FaceEmbedding fe : allEmbeddings) {
            if (fe == null || fe.getEmbeddingJson() == null || fe.getEmbeddingJson().isBlank()) {
                continue;
            }
            if (excludeUserId != null && fe.getUser() != null && fe.getUser().getId().equals(excludeUserId)) {
                continue;
            }
            if (isMatch(fe.getEmbeddingJson(), liveEmbedding)) {
                return Optional.ofNullable(fe.getUser());
            }
        }

        return Optional.empty();
    }
}
