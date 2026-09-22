package com.smartvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartvote.entity.enums.Role;
import com.smartvote.entity.enums.UserStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_voter_id", columnList = "voterIdNumber")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String mobileNumber;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.ROLE_VOTER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.APPROVED;

    @Column(length = 50)
    private String voterIdNumber;

    @Column(length = 50)
    private String maskedAadhaar;

    @Column(columnDefinition = "TEXT")
    private String faceImageUrl;

    @Column(nullable = false)
    private Integer failedLoginAttempts = 0;

    private LocalDateTime accountLockedUntil;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private FaceEmbedding faceEmbedding;

    @OneToMany(mappedBy = "voter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Vote> votes = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public User() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.failedLoginAttempts == null) {
            this.failedLoginAttempts = 0;
        }
        if (this.status == null) {
            this.status = UserStatus.APPROVED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getVoterIdNumber() {
        return voterIdNumber;
    }

    public void setVoterIdNumber(String voterIdNumber) {
        this.voterIdNumber = voterIdNumber;
    }

    public String getMaskedAadhaar() {
        return maskedAadhaar;
    }

    public void setMaskedAadhaar(String maskedAadhaar) {
        this.maskedAadhaar = maskedAadhaar;
    }

    public String getFaceImageUrl() {
        return faceImageUrl;
    }

    public void setFaceImageUrl(String faceImageUrl) {
        this.faceImageUrl = faceImageUrl;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getAccountLockedUntil() {
        return accountLockedUntil;
    }

    public void setAccountLockedUntil(LocalDateTime accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }

    public FaceEmbedding getFaceEmbedding() {
        return faceEmbedding;
    }

    public void setFaceEmbedding(FaceEmbedding faceEmbedding) {
        this.faceEmbedding = faceEmbedding;
        if (faceEmbedding != null) {
            faceEmbedding.setUser(this);
        }
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
