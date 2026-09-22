package com.smartvote.service;

import com.smartvote.entity.OtpVerification;
import com.smartvote.entity.enums.OtpPurpose;
import com.smartvote.exception.InvalidOtpException;
import com.smartvote.repository.OtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpRepository otpRepository;

    @Value("${app.jwt.otp-expiration-seconds:120}")
    private int otpExpirationSeconds;

    public OtpService(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @Transactional
    public String generateAndSaveOtp(String email, OtpPurpose purpose) {
        // Generate secure 6-digit code
        int codeInt = 100000 + RANDOM.nextInt(900000);
        String otpCode = String.valueOf(codeInt);

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(otpExpirationSeconds);

        OtpVerification otpVerification = new OtpVerification(email, otpCode, purpose, expiresAt);
        otpRepository.save(otpVerification);

        log.info("OTP generated for [{}]: Code: {}, Expires in: {}s", email, otpCode, otpExpirationSeconds);
        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(String email, String inputCode, OtpPurpose purpose) {
        Optional<OtpVerification> opt = otpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose);

        if (opt.isEmpty()) {
            throw new InvalidOtpException("No active OTP request found for this email. Please request a new code.");
        }

        OtpVerification otp = opt.get();

        if (otp.getVerified()) {
            throw new InvalidOtpException("This OTP has already been used. Please request a new code.");
        }

        if (otp.isExpired()) {
            throw new InvalidOtpException("This OTP has expired. Please request a new code.");
        }

        if (otp.getAttemptCount() >= 5) {
            throw new InvalidOtpException("Too many incorrect attempts. Please request a new OTP.");
        }

        otp.setAttemptCount(otp.getAttemptCount() + 1);

        if (!otp.getOtpCode().equals(inputCode.trim())) {
            otpRepository.save(otp);
            throw new InvalidOtpException("Invalid OTP code. Please check and try again.");
        }

        otp.setVerified(true);
        otpRepository.save(otp);
        log.info("OTP successfully verified for [{}]", email);
        return true;
    }
}
