package com.smartvote.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FaceService {

    private static final Logger log = LoggerFactory.getLogger(FaceService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.face.similarity-threshold:0.85}")
    private double similarityThreshold;

    /**
     * Calculates cosine similarity between two 128-dimensional embedding vectors.
     * Returns a score between 0.0 and 1.0.
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
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        // Normalize range from [-1, 1] to [0, 1] for intuitive percentage
        return Math.max(0.0, Math.min(1.0, (similarity + 1.0) / 2.0));
    }

    public boolean isMatch(String storedEmbeddingJson, List<Double> liveEmbedding) {
        return isMatch(storedEmbeddingJson, liveEmbedding, this.similarityThreshold);
    }

    public boolean isMatch(String storedEmbeddingJson, List<Double> liveEmbedding, double threshold) {
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

            double similarity = calculateCosineSimilarity(vecA, vecB);
            log.info("Face biometric similarity evaluated: {}% [Score: {}] (Required Threshold: {}%)",
                    String.format("%.2f", similarity * 100),
                    String.format("%.4f", similarity),
                    String.format("%.0f", threshold * 100));
            return similarity >= threshold;
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
        return similarityThreshold;
    }
}
