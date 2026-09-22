package com.smartvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_embeddings")
public class FaceEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String embeddingJson;

    @Column(length = 50)
    private String modelVersion = "face-recognition-net-v1";

    private Double qualityScore;

    @Column(nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    public FaceEmbedding() {
    }

    public FaceEmbedding(User user, String embeddingJson, Double qualityScore) {
        this.user = user;
        this.embeddingJson = embeddingJson;
        this.qualityScore = qualityScore;
    }

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = LocalDateTime.now();
        if (this.modelVersion == null) {
            this.modelVersion = "face-recognition-net-v1";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getEmbeddingJson() {
        return embeddingJson;
    }

    public void setEmbeddingJson(String embeddingJson) {
        this.embeddingJson = embeddingJson;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }
}
