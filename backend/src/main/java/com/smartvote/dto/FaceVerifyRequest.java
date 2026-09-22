package com.smartvote.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class FaceVerifyRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Session token is required")
    private String sessionToken;

    private List<Double> liveEmbedding;

    private Boolean livenessPassed;

    private Boolean blinkDetected;

    private Boolean headTurnDetected;

    private String deviceFingerprint;

    public FaceVerifyRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public List<Double> getLiveEmbedding() {
        return liveEmbedding;
    }

    public void setLiveEmbedding(List<Double> liveEmbedding) {
        this.liveEmbedding = liveEmbedding;
    }

    public Boolean getLivenessPassed() {
        return livenessPassed;
    }

    public void setLivenessPassed(Boolean livenessPassed) {
        this.livenessPassed = livenessPassed;
    }

    public Boolean getBlinkDetected() {
        return blinkDetected;
    }

    public void setBlinkDetected(Boolean blinkDetected) {
        this.blinkDetected = blinkDetected;
    }

    public Boolean getHeadTurnDetected() {
        return headTurnDetected;
    }

    public void setHeadTurnDetected(Boolean headTurnDetected) {
        this.headTurnDetected = headTurnDetected;
    }

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }
}
