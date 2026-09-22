package com.smartvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(name = "uk_election_voter", columnNames = {"election_id", "voter_id"}),
    @UniqueConstraint(name = "uk_receipt_id", columnNames = {"receiptId"})
}, indexes = {
    @Index(name = "idx_vote_receipt_id", columnList = "receiptId", unique = true),
    @Index(name = "idx_vote_election", columnList = "election_id"),
    @Index(name = "idx_vote_voter", columnList = "voter_id")
})
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voter_id", nullable = false)
    @JsonIgnore
    private User voter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, unique = true, length = 64)
    private String receiptId;

    @Column(nullable = false, length = 64)
    private String receiptHash;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String digitalSignature;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 255)
    private String userAgent;

    @Column(nullable = false, updatable = false)
    private LocalDateTime votedAt;

    public Vote() {
    }

    @PrePersist
    protected void onCreate() {
        this.votedAt = LocalDateTime.now();
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

    public User getVoter() {
        return voter;
    }

    public void setVoter(User voter) {
        this.voter = voter;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public String getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(String receiptId) {
        this.receiptId = receiptId;
    }

    public String getReceiptHash() {
        return receiptHash;
    }

    public void setReceiptHash(String receiptHash) {
        this.receiptHash = receiptHash;
    }

    public String getDigitalSignature() {
        return digitalSignature;
    }

    public void setDigitalSignature(String digitalSignature) {
        this.digitalSignature = digitalSignature;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }
}
