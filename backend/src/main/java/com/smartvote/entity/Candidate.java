package com.smartvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates", indexes = {
    @Index(name = "idx_candidate_election", columnList = "election_id")
})
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    @JsonIgnore
    private Election election;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String partyName;

    @Column(length = 255)
    private String partySymbol;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String manifesto;

    @Column(nullable = false)
    private Integer voteCount = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Candidate() {
    }

    public Candidate(String fullName, String partyName, String partySymbol, String photoUrl, String manifesto) {
        this.fullName = fullName;
        this.partyName = partyName;
        this.partySymbol = partySymbol;
        this.photoUrl = photoUrl;
        this.manifesto = manifesto;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.voteCount == null) {
            this.voteCount = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Election getElection() {
        return election;
    }

    public void setElection(Election election) {
        this.election = election;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPartyName() {
        return partyName;
    }

    public void setPartyName(String partyName) {
        this.partyName = partyName;
    }

    public String getPartySymbol() {
        return partySymbol;
    }

    public void setPartySymbol(String partySymbol) {
        this.partySymbol = partySymbol;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getManifesto() {
        return manifesto;
    }

    public void setManifesto(String manifesto) {
        this.manifesto = manifesto;
    }

    public Integer getVoteCount() {
        return voteCount;
    }

    public void setVoteCount(Integer voteCount) {
        this.voteCount = voteCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
