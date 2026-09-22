package com.smartvote.entity;

import com.smartvote.entity.enums.OtpPurpose;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications", indexes = {
    @Index(name = "idx_otp_email_purpose", columnList = "email, purpose")
})
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 10)
    private String otpCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OtpPurpose purpose = OtpPurpose.LOGIN;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private Integer attemptCount = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public OtpVerification() {
    }

    public OtpVerification(String email, String otpCode, OtpPurpose purpose, LocalDateTime expiresAt) {
        this.email = email;
        this.otpCode = otpCode;
        this.purpose = purpose;
        this.expiresAt = expiresAt;
        this.verified = false;
        this.attemptCount = 0;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.verified == null) {
            this.verified = false;
        }
        if (this.attemptCount == null) {
            this.attemptCount = 0;
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public OtpPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public Integer getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(Integer attemptCount) {
        this.attemptCount = attemptCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
