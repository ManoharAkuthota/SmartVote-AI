package com.smartvote.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartvote.entity.enums.LoginStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_histories", indexes = {
    @Index(name = "idx_login_email", columnList = "email"),
    @Index(name = "idx_login_status", columnList = "status"),
    @Index(name = "idx_login_time", columnList = "timestamp")
})
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 255)
    private String userAgent;

    @Column(length = 100)
    private String deviceFingerprint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoginStatus status;

    @Column(length = 255)
    private String failureReason;

    @Column(length = 100)
    private String locationInfo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public LoginHistory() {
    }

    public LoginHistory(String email, User user, String ipAddress, String userAgent, String deviceFingerprint,
                        LoginStatus status, String failureReason, String locationInfo) {
        this.email = email;
        this.user = user;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.deviceFingerprint = deviceFingerprint;
        this.status = status;
        this.failureReason = failureReason;
        this.locationInfo = locationInfo;
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }

    public LoginStatus getStatus() {
        return status;
    }

    public void setStatus(LoginStatus status) {
        this.status = status;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getLocationInfo() {
        return locationInfo;
    }

    public void setLocationInfo(String locationInfo) {
        this.locationInfo = locationInfo;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
