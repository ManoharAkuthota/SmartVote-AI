package com.smartvote.dto;

public class LoginInitResponse {

    private String nextStep; // "FACE_VERIFY" or "OTP_VERIFY"
    private String sessionToken;
    private String email;
    private String fullName;
    private boolean faceEnrolled;
    private String maskedMobile;

    public LoginInitResponse() {
    }

    public LoginInitResponse(String nextStep, String sessionToken, String email, String fullName, boolean faceEnrolled, String maskedMobile) {
        this.nextStep = nextStep;
        this.sessionToken = sessionToken;
        this.email = email;
        this.fullName = fullName;
        this.faceEnrolled = faceEnrolled;
        this.maskedMobile = maskedMobile;
    }

    public String getNextStep() {
        return nextStep;
    }

    public void setNextStep(String nextStep) {
        this.nextStep = nextStep;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public boolean isFaceEnrolled() {
        return faceEnrolled;
    }

    public void setFaceEnrolled(boolean faceEnrolled) {
        this.faceEnrolled = faceEnrolled;
    }

    public String getMaskedMobile() {
        return maskedMobile;
    }

    public void setMaskedMobile(String maskedMobile) {
        this.maskedMobile = maskedMobile;
    }
}
