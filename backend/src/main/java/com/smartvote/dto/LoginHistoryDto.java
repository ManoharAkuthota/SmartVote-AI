package com.smartvote.dto;

import com.smartvote.entity.LoginHistory;
import com.smartvote.entity.enums.LoginStatus;
import java.time.LocalDateTime;

public class LoginHistoryDto {

    private Long id;
    private String email;
    private String ipAddress;
    private String userAgent;
    private String deviceFingerprint;
    private LoginStatus status;
    private String failureReason;
    private String locationInfo;
    private LocalDateTime timestamp;

    public LoginHistoryDto() {
    }

    public static LoginHistoryDto fromEntity(LoginHistory l) {
        if (l == null) return null;
        LoginHistoryDto dto = new LoginHistoryDto();
        dto.setId(l.getId());
        dto.setEmail(l.getEmail());
        dto.setIpAddress(l.getIpAddress());
        dto.setUserAgent(l.getUserAgent());
        dto.setDeviceFingerprint(l.getDeviceFingerprint());
        dto.setStatus(l.getStatus());
        dto.setFailureReason(l.getFailureReason());
        dto.setLocationInfo(l.getLocationInfo());
        dto.setTimestamp(l.getTimestamp());
        return dto;
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

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
