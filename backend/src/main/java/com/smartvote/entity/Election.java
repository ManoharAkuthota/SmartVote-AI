package com.smartvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartvote.entity.enums.ElectionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "elections", indexes = {
    @Index(name = "idx_election_status", columnList = "status"),
    @Index(name = "idx_election_dates", columnList = "startDate, endDate")
})
public class Election {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String bannerUrl;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ElectionStatus status = ElectionStatus.UPCOMING;

    @Column(nullable = false)
    private Integer totalVotes = 0;

    @OneToMany(mappedBy = "election", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Candidate> candidates = new ArrayList<>();

    @OneToMany(mappedBy = "election", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Vote> votes = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Election() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.totalVotes == null) {
            this.totalVotes = 0;
        }
        if (this.status == null) {
            this.status = ElectionStatus.UPCOMING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addCandidate(Candidate candidate) {
        candidates.add(candidate);
        candidate.setElection(this);
    }

    public void removeCandidate(Candidate candidate) {
        candidates.remove(candidate);
        candidate.setElection(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public ElectionStatus getStatus() {
        return status;
    }

    public void setStatus(ElectionStatus status) {
        this.status = status;
    }

    public Integer getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes;
    }

    public List<Candidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<Candidate> candidates) {
        this.candidates = candidates;
    }

    public List<Vote> getVotes() {
        return votes;
    }

    public void setVotes(List<Vote> votes) {
        this.votes = votes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
