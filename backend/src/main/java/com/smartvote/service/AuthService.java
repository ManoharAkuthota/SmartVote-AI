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
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private final SmsService smsService;
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
                       SmsService smsService,
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
        this.smsService = smsService;
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

        // Enforce Unique Face & Anti-Spoofing Liveness: Check face uniqueness and ensure live capture
        if (req.getFaceEmbedding() != null && !req.getFaceEmbedding().isEmpty()) {
            if (req.getLivenessPassed() == null || !req.getLivenessPassed()) {
                throw new BadRequestException("Facial Anti-Spoofing Violation: Photo enrollment requires verified live liveness detection (blink and head movement). Static photos or screen reproductions cannot be enrolled.");
            }

            List<FaceEmbedding> allEnrolled = faceEmbeddingRepository.findAllWithUser();
            Optional<User> duplicateUser = faceService.findMatchingUserInDatabase(req.getFaceEmbedding(), allEnrolled, null);
            if (duplicateUser.isPresent()) {
                User dup = duplicateUser.get();
                String maskedEmail = maskEmail(dup.getEmail());
                auditService.logAction(cleanEmail, Role.ROLE_VOTER.name(), "DUPLICATE_FACE_REGISTRATION_REJECTED",
                        "User", String.valueOf(dup.getId()),
                        "Attempted registration with face already enrolled under " + maskedEmail, ipAddress);
                throw new BadRequestException("Facial Uniqueness Violation: This face is already enrolled on the National Electoral Roll under citizen account (" + maskedEmail + " / EPIC: " + dup.getVoterIdNumber() + "). Under Election Commission of India guidelines, each citizen is strictly permitted only ONE registered voter identity.");
            }
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
                "Enrolled digital citizen identity with facial security descriptor", ipAddress);

        // Send registration success email
        emailService.sendRegistrationSuccessEmail(cleanEmail, savedUser.getFullName(), voterId);

        // Create welcome notification
        notificationService.createNotification(savedUser, "Identity Enrolled Successfully",
                "Welcome to SmartVote Bharat. Your voter identity (" + voterId + ") and facial security profile are now verified.",
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
            smsService.sendOtpSms(user.getMobileNumber(), otpCode);
            String sessionToken = jwtService.generateTemporarySessionToken(cleanEmail, "OTP_VERIFY");
            LoginInitResponse resp = new LoginInitResponse("OTP_VERIFY", sessionToken, cleanEmail, user.getFullName(), hasFace, maskedMobile);
            resp.setDemoOtp(otpCode);
            resp.setFaceImageUrl(user.getFaceImageUrl());
            resp.setVoterIdNumber(user.getVoterIdNumber());
            return resp;
        }

        // Voter accounts require Face Verification
        String sessionToken = jwtService.generateTemporarySessionToken(cleanEmail, "FACE_VERIFY");
        LoginInitResponse resp = new LoginInitResponse("FACE_VERIFY", sessionToken, cleanEmail, user.getFullName(), hasFace, maskedMobile);
        resp.setFaceImageUrl(user.getFaceImageUrl());
        resp.setVoterIdNumber(user.getVoterIdNumber());
        return resp;
    }

    @Transactional
    public LoginInitResponse verifyFace(FaceVerifyRequest req, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", cleanEmail));

        // Anti-Spoofing & Liveness verification check
        if (req.getLivenessPassed() == null || !req.getLivenessPassed()) {
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Liveness check failed (anti-spoofing not verified)", "Unknown");
            throw new FaceMatchException("Facial Anti-Spoofing Security Error: Live human liveness (eye-blink and head movement) is strictly required. Static photos or screen reproductions are forbidden under ECI Article 324.");
        }

        if (req.getBlinkDetected() == null || !req.getBlinkDetected()) {
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Liveness check failed (eye blink missing)", "Unknown");
            throw new FaceMatchException("Facial Anti-Spoofing Error: Natural eye blink not detected. Please position your face and blink naturally in front of the camera.");
        }

        if (req.getHeadTurnDetected() == null || !req.getHeadTurnDetected()) {
            auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                    req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Liveness check failed (head movement missing)", "Unknown");
            throw new FaceMatchException("Facial Anti-Spoofing Error: Natural 3D head movement not detected. Please slightly turn your head to confirm physical presence.");
        }

        FaceEmbedding storedEmbedding = faceEmbeddingRepository.findByUserId(user.getId())
                .orElseThrow(() -> new FaceMatchException("No enrolled facial security profile found for this account. Please re-register."));

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
                throw new AccountLockedException("Account locked due to multiple failed facial verification attempts. Please wait 15 minutes.");
            }
            userRepository.save(user);
            int remaining = 5 - attempts;

            // Check if this live face actually belongs to ANOTHER citizen enrolled in the database
            List<FaceEmbedding> allEnrolled = faceEmbeddingRepository.findAllWithUser();
            Optional<User> otherCitizen = faceService.findMatchingUserInDatabase(req.getLiveEmbedding(), allEnrolled, user.getId());

            if (otherCitizen.isPresent()) {
                User other = otherCitizen.get();
                auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                        req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Face matches different user: " + other.getEmail(), "Unknown");
                throw new FaceMatchException("Security Alert — Impersonation Detected! Your live face matches a different registered citizen (" + other.getFullName() + " / EPIC: " + other.getVoterIdNumber() + ") and NOT the enrolled photo in the database for " + user.getFullName() + ". Access is strictly denied (" + remaining + " attempts remaining).");
            } else {
                auditService.logLogin(cleanEmail, user, ipAddress, userAgent,
                        req.getDeviceFingerprint(), LoginStatus.FAILED_FACE, "Face embedding does not match database photo", "Unknown");
                throw new FaceMatchException("Facial Verification Error: Live camera face does not match the enrolled photo in the database for " + user.getFullName() + " (" + remaining + " attempts remaining). Access denied.");
            }
        }

        // Facial security passed! Generate 6-digit OTP and send email
        String otpCode = otpService.generateAndSaveOtp(cleanEmail, OtpPurpose.LOGIN);
        emailService.sendOtpEmail(cleanEmail, otpCode, otpExpirationSeconds);
        smsService.sendOtpSms(user.getMobileNumber(), otpCode);

        String sessionToken = jwtService.generateTemporarySessionToken(cleanEmail, "OTP_VERIFY");
        String maskedMobile = maskMobileNumber(user.getMobileNumber());

        auditService.logAction(cleanEmail, user.getRole().name(), "FACIAL_SECURITY_VERIFIED",
                "User", String.valueOf(user.getId()), "Live facial security and liveness verified", ipAddress);

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
                req.getDeviceFingerprint(), LoginStatus.SUCCESS, "Full 2FA Facial Security Authentication Successful", "Local");
        auditService.logAction(cleanEmail, user.getRole().name(), "USER_LOGIN_SUCCESS",
                "User", String.valueOf(user.getId()), "Logged in via Facial Security + OTP", ipAddress);

        return new JwtResponse(jwt, UserDto.fromEntity(user));
    }

    @Transactional
    public String resendOtp(ResendOtpRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", cleanEmail));

        String otpCode = otpService.generateAndSaveOtp(cleanEmail, OtpPurpose.LOGIN);
        emailService.sendOtpEmail(cleanEmail, otpCode, otpExpirationSeconds);
        smsService.sendOtpSms(user.getMobileNumber(), otpCode);
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

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "XXXX@XXXX.com";
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.substring(0, 2) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }
}
