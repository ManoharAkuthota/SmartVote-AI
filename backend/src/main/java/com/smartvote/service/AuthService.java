package com.smartvote.service;

import com.smartvote.dto.*;
import com.smartvote.entity.FaceEmbedding;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.LoginStatus;
import com.smartvote.entity.enums.NotificationType;
import com.smartvote.entity.enums.OtpPurpose;
import com.smartvote.entity.enums.Role;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.exception.*;
import com.smartvote.repository.FaceEmbeddingRepository;
import com.smartvote.repository.UserRepository;
import com.smartvote.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FaceService faceService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final UserDetailsService userDetailsService;

    @Value("${app.jwt.otp-expiration-seconds:120}")
    private int otpExpirationSeconds;

    public AuthService(UserRepository userRepository,
                       FaceEmbeddingRepository faceEmbeddingRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       FaceService faceService,
                       OtpService otpService,
                       EmailService emailService,
                       CloudinaryService cloudinaryService,
                       AuditService auditService,
                       NotificationService notificationService,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.faceEmbeddingRepository = faceEmbeddingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.faceService = faceService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.cloudinaryService = cloudinaryService;
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public UserDto register(RegisterRequest req, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An account with email " + cleanEmail + " already exists");
        }

        // Generate Demo Voter ID and Masked Aadhaar if not specified
        String voterId = req.getVoterIdNumber();
        if (voterId == null || voterId.isBlank()) {
            voterId = "SMV-" + (1000000 + RANDOM.nextInt(9000000));
        }

        String maskedAadhaar = req.getMaskedAadhaar();
        if (maskedAadhaar == null || maskedAadhaar.isBlank()) {
            maskedAadhaar = "XXXX-XXXX-" + (1000 + RANDOM.nextInt(9000));
        }

        // Upload face image to Cloudinary (or secure fallback)
        String uploadedFaceUrl = cloudinaryService.uploadFaceImage(req.getFaceImageUrl(), cleanEmail);

        User user = new User();
        user.setFullName(req.getFullName().trim());
        user.setEmail(cleanEmail);
        user.setMobileNumber(req.getMobileNumber().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.ROLE_VOTER);
        user.setStatus(UserStatus.APPROVED); // Default approved for demo simulation
        user.setVoterIdNumber(voterId);
        user.setMaskedAadhaar(maskedAadhaar);
        user.setFaceImageUrl(uploadedFaceUrl);
        user.setFailedLoginAttempts(0);

        User savedUser = userRepository.save(user);

        // Store Face Embedding if provided
        if (req.getFaceEmbedding() != null && !req.getFaceEmbedding().isEmpty()) {
            String embeddingJson = faceService.serializeEmbedding(req.getFaceEmbedding());
            FaceEmbedding faceEmbedding = new FaceEmbedding(
                    savedUser,
                    embeddingJson,
                    req.getQualityScore() != null ? req.getQualityScore() : 0.95
            );
            faceEmbeddingRepository.save(faceEmbedding);
            savedUser.setFaceEmbedding(faceEmbedding);
        }

        // Log registration audit
        auditService.logAction(cleanEmail, Role.ROLE_VOTER.name(), "USER_REGISTER",
                "User", String.valueOf(savedUser.getId()),
                "Enrolled demo digital identity with biometric face descriptor", ipAddress);

        // Send registration success email
        emailService.sendRegistrationSuccessEmail(cleanEmail, savedUser.getFullName(), voterId);

        // Create welcome notification
        notificationService.createNotification(savedUser, "Identity Enrolled Successfully",
                "Welcome to SmartVote AI. Your demo identity (" + voterId + ") and facial biometric profile are now verified.",
                NotificationType.SUCCESS);

        log.info("Registered new voter: [{}] with Voter ID: {}", cleanEmail, voterId);
        return UserDto.fromEntity(savedUser);
    }

    @Transactional
    public LoginInitResponse loginInit(LoginInitialRequest req, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> {
                    auditService.logLogin(cleanEmail, null, ipAddress, userAgent,
                            req.getDeviceFingerprint(), LoginStatus.FAILED_PASSWORD, "User not found", "Unknown");
                    return new BadCredentialsException("Invalid email or password");
                });

        // Check account lock status
        if (user.getStatus() == UserStatus.LOCKED) {
            if (user.getAccountLockedUntil() != null && LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
                auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                        req.getDeviceFingerprint(), LoginStatus.LOCKED, "Account is currently locked", "Unknown");
                throw new AccountLockedException("Your account is temporarily locked due to multiple failed attempts. Please try again later.");
            } else {
                // Auto-unlock
                user.setStatus(UserStatus.APPROVED);
                user.setFailedLoginAttempts(0);
                user.setAccountLockedUntil(null);
                userRepository.save(user);
            }
        }

        if (user.getStatus() == UserStatus.REJECTED) {
            throw new UnauthorizedException("Your voter registration was rejected. Please contact election administration.");
        }

        // Validate password
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setStatus(UserStatus.LOCKED);
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);
                auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                        req.getDeviceFingerprint(), LoginStatus.LOCKED, "Account locked after 5 failed password attempts", "Unknown");
                throw new AccountLockedException("Account locked due to 5 consecutive failed attempts. Please wait 15 minutes.");
            }
            userRepository.save(user);
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_PASSWORD, "Incorrect password", "Unknown");
            throw new BadCredentialsException("Invalid email or password");
        }

        // Credentials valid -> Determine next step
        String maskedMobile = maskMobileNumber(user.getMobileNumber());
        boolean hasFace = faceEmbeddingRepository.findByUserId(user.getId()).isPresent();

        // Admin accounts can bypass face or go directly to OTP
        if (user.getRole() == Role.ROLE_ADMIN) {
            String otpCode = otpService.generateAndSaveOtp(cleanEmail, OtpPurpose.LOGIN);
            emailService.sendOtpEmail(cleanEmail, otpCode, otpExpirationSeconds);
            String sessionToken = jwtService.generateTemporarySessionToken(cleanEmail, "OTP_VERIFY");
            LoginInitResponse resp = new LoginInitResponse("OTP_VERIFY", sessionToken, cleanEmail, user.getFullName(), hasFace, maskedMobile);
            resp.setDemoOtp(otpCode);
            return resp;
        }

        // Voter accounts require Face Verification
        String sessionToken = jwtService.generateTemporarySessionToken(cleanEmail, "FACE_VERIFY");
        return new LoginInitResponse("FACE_VERIFY", sessionToken, cleanEmail, user.getFullName(), hasFace, maskedMobile);
    }

    @Transactional
    public LoginInitResponse verifyFace(FaceVerifyRequest req, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", cleanEmail));

        // Liveness verification check
        if (req.getLivenessPassed() == null || !req.getLivenessPassed()) {
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Liveness check failed (blink/head movement missing)", "Unknown");
            throw new FaceMatchException("Facial liveness verification failed. Please ensure you blink and turn your head in front of the camera.");
        }

        FaceEmbedding storedEmbedding = faceEmbeddingRepository.findByUserId(user.getId())
                .orElseThrow(() -> new FaceMatchException("No enrolled face biometric found for this account. Please re-register."));

        boolean match = faceService.isMatch(storedEmbedding.getEmbeddingJson(), req.getLiveEmbedding());
        if (!match) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setStatus(UserStatus.LOCKED);
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);
                auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                        req.getDeviceFingerprint(), LoginStatus.LOCKED, "Account locked after 5 failed face matches", "Unknown");
                throw new AccountLockedException("Account locked due to multiple failed biometric attempts. Please wait 15 minutes.");
            }
            userRepository.save(user);
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Face embedding similarity < 0.85", "Unknown");
            throw new FaceMatchException("Facial recognition mismatch. Biometric similarity is below the required 85% threshold.");
        }

        // Biometric passed! Generate 6-digit OTP and send email
        String otpCode = otpService.generateAndSaveOtp(cleanEmail, OtpPurpose.LOGIN);
        emailService.sendOtpEmail(cleanEmail, otpCode, otpExpirationSeconds);

        String sessionToken = jwtService.generateTemporarySessionToken(cleanEmail, "OTP_VERIFY");
        String maskedMobile = maskMobileNumber(user.getMobileNumber());

        auditService.logAction(cleanEmail, user.getRole().name(), "BIOMETRIC_VERIFIED",
                "User", String.valueOf(user.getId()), "Live facial biometric and liveness verified", ipAddress);

        LoginInitResponse resp = new LoginInitResponse("OTP_VERIFY", sessionToken, cleanEmail, user.getFullName(), true, maskedMobile);
        resp.setDemoOtp(otpCode);
        return resp;
    }

    @Transactional
    public JwtResponse verifyOtp(OtpVerifyRequest req, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", cleanEmail));

        // Verify OTP
        try {
            otpService.verifyOtp(cleanEmail, req.getOtpCode(), OtpPurpose.LOGIN);
        } catch (InvalidOtpException e) {
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_OTP, e.getMessage(), "Unknown");
            throw e;
        }

        // Reset failed login counter on complete success
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);

        // Generate full JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(cleanEmail);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        claims.put("fullName", user.getFullName());
        claims.put("voterId", user.getVoterIdNumber());

        String jwt = jwtService.generateToken(userDetails, claims);

        auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                req.getDeviceFingerprint(), LoginStatus.SUCCESS, "Full 2FA Biometric Authentication Successful", "Local");
        auditService.logAction(cleanEmail, user.getRole().name(), "USER_LOGIN_SUCCESS",
                "User", String.valueOf(user.getId()), "Logged in via Biometric + OTP", ipAddress);

        return new JwtResponse(jwt, UserDto.fromEntity(user));
    }

    @Transactional
    public String resendOtp(ResendOtpRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", cleanEmail));

        String otpCode = otpService.generateAndSaveOtp(cleanEmail, OtpPurpose.LOGIN);
        emailService.sendOtpEmail(cleanEmail, otpCode, otpExpirationSeconds);
        return otpCode;
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserDto.fromEntity(user);
    }

    private String maskMobileNumber(String mobile) {
        if (mobile == null || mobile.length() < 4) {
            return "******0000";
        }
        return "******" + mobile.substring(mobile.length() - 4);
    }
}
