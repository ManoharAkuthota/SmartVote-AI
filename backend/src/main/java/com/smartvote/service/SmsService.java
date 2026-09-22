package com.smartvote.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    @Value("${app.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${app.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${app.twilio.phone-number:}")
    private String twilioPhoneNumber;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Async
    public void sendOtpSms(String mobileNumber, String otpCode) {
        if (mobileNumber == null || mobileNumber.isBlank()) {
            log.info("No mobile number on file for voter. Skipping SMS dispatch.");
            return;
        }

        // Clean mobile number (strip spaces/hyphens)
        String cleanNumber = mobileNumber.replaceAll("[^+\\d]", "");
        if (cleanNumber.isBlank()) {
            return;
        }

        if (twilioAccountSid == null || twilioAccountSid.isBlank() ||
            twilioAuthToken == null || twilioAuthToken.isBlank() ||
            twilioPhoneNumber == null || twilioPhoneNumber.isBlank()) {
            log.info("Twilio SMS Gateway not configured. Simulated SMS to [{}]: Your SmartVote AI verification code is {}", cleanNumber, otpCode);
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";
            String body = "SmartVote AI: Your verification code is " + otpCode + ". Valid for 2 minutes. Do not share this code.";

            String formData = "To=" + URLEncoder.encode(cleanNumber, StandardCharsets.UTF_8)
                    + "&From=" + URLEncoder.encode(twilioPhoneNumber, StandardCharsets.UTF_8)
                    + "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);

            String authHeader = "Basic " + Base64.getEncoder().encodeToString(
                    (twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formData))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("SMS successfully dispatched to [{}] via Twilio", cleanNumber);
            } else {
                log.warn("Twilio SMS dispatch returned HTTP {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch SMS via Twilio to [{}]: {}", cleanNumber, e.getMessage());
        }
    }
}
