package com.smartvote.service;

import com.smartvote.dto.FaceVerifyRequest;
import com.smartvote.dto.RegisterRequest;
import com.smartvote.entity.FaceEmbedding;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.Role;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.exception.BadRequestException;
import com.smartvote.exception.FaceMatchException;
import com.smartvote.repository.FaceEmbeddingRepository;
import com.smartvote.repository.UserRepository;
import com.smartvote.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FacialUniquenessSecurityTest {

    @Spy
    private FaceService faceService = new FaceService();

    @Mock
    private UserRepository userRepository;

    @Mock
    private FaceEmbeddingRepository faceEmbeddingRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AuthService authService;

    private List<Double> personAVector;
    private List<Double> personBVector;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(faceService, "maxDistanceThreshold", 0.60);
        ReflectionTestUtils.setField(faceService, "minCosineThreshold", 0.78);
        ReflectionTestUtils.setField(authService, "otpExpirationSeconds", 120);

        personAVector = new ArrayList<>(128);
        personBVector = new ArrayList<>(128);
        for (int i = 0; i < 128; i++) {
            personAVector.add(0.05 + (i % 5) * 0.02);
            personBVector.add(0.85 - (i % 7) * 0.04);
        }
    }

    @Test
    @DisplayName("FaceService: Identical/similar vectors should be recognized as a match")
    void testIdenticalFaceVectorsMatch() {
        String jsonA = faceService.serializeEmbedding(personAVector);
        assertTrue(faceService.isMatch(jsonA, personAVector), "Identical vectors must match");
    }

    @Test
    @DisplayName("FaceService: Dissimilar vectors should be recognized as different persons")
    void testDissimilarFaceVectorsMismatch() {
        String jsonA = faceService.serializeEmbedding(personAVector);
        assertFalse(faceService.isMatch(jsonA, personBVector), "Dissimilar vectors must not match");
    }

    @Test
    @DisplayName("FaceService: findMatchingUserInDatabase finds enrolled person")
    void testFindMatchingUserInDatabase() {
        User user1 = new User();
        user1.setId(1L);
        user1.setFullName("Aarav Sharma");
        user1.setEmail("aarav@example.com");

        FaceEmbedding fe1 = new FaceEmbedding(user1, faceService.serializeEmbedding(personAVector), 0.98);

        Optional<User> match = faceService.findMatchingUserInDatabase(personAVector, List.of(fe1), null);
        assertTrue(match.isPresent(), "Matching face should return user1");
        assertEquals("Aarav Sharma", match.get().getFullName());

        Optional<User> excluded = faceService.findMatchingUserInDatabase(personAVector, List.of(fe1), 1L);
        assertTrue(excluded.isEmpty(), "Excluded user ID should not be returned");
    }

    @Test
    @DisplayName("AuthService.register: Duplicate face registration is strictly rejected")
    void testRegisterDuplicateFaceRejected() {
        User existingUser = new User();
        existingUser.setId(10L);
        existingUser.setEmail("existing.voter@smartvote.ai");
        existingUser.setVoterIdNumber("IND-DL-1234567");

        FaceEmbedding existingFe = new FaceEmbedding(existingUser, faceService.serializeEmbedding(personAVector), 0.99);
        when(userRepository.existsByEmail("new.voter@smartvote.ai")).thenReturn(false);
        when(faceEmbeddingRepository.findAllWithUser()).thenReturn(List.of(existingFe));

        RegisterRequest req = new RegisterRequest();
        req.setEmail("new.voter@smartvote.ai");
        req.setPassword("Secret@123");
        req.setFullName("New Voter");
        req.setMobileNumber("+91-9876543210");
        req.setFaceEmbedding(personAVector);
        req.setLivenessPassed(true);
        req.setBlinkDetected(true);
        req.setHeadTurnDetected(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Facial Uniqueness Violation"), "Must contain Facial Uniqueness Violation message");
        assertTrue(ex.getMessage().contains("IND-DL-1234567"), "Must mention existing user's Voter ID");
    }

    @Test
    @DisplayName("AuthService.register: Registration with static photo or unverified liveness is rejected")
    void testRegisterLivenessMissingRejected() {
        when(userRepository.existsByEmail("new.voter@smartvote.ai")).thenReturn(false);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("new.voter@smartvote.ai");
        req.setPassword("Secret@123");
        req.setFullName("New Voter");
        req.setMobileNumber("+91-9876543210");
        req.setFaceEmbedding(personAVector);
        req.setLivenessPassed(false); // Static photo or bypass attempt

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            authService.register(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Facial Anti-Spoofing Violation"), "Must reject static photo on registration");
    }

    @Test
    @DisplayName("AuthService.verifyFace: Missing liveness check triggers Anti-Spoofing error")
    void testVerifyFaceLivenessMissingRejected() {
        User user = new User();
        user.setId(20L);
        user.setEmail("voter@smartvote.ai");
        user.setFullName("Rajesh Kumar Verma");

        when(userRepository.findByEmail("voter@smartvote.ai")).thenReturn(Optional.of(user));

        FaceVerifyRequest req = new FaceVerifyRequest();
        req.setEmail("voter@smartvote.ai");
        req.setLiveEmbedding(personAVector);
        req.setLivenessPassed(false);

        FaceMatchException ex = assertThrows(FaceMatchException.class, () -> {
            authService.verifyFace(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Facial Anti-Spoofing Security Error"), "Must flag missing liveness");
    }

    @Test
    @DisplayName("AuthService.verifyFace: Missing eye blink triggers Anti-Spoofing error")
    void testVerifyFaceBlinkMissingRejected() {
        User user = new User();
        user.setId(20L);
        user.setEmail("voter@smartvote.ai");
        user.setFullName("Rajesh Kumar Verma");

        when(userRepository.findByEmail("voter@smartvote.ai")).thenReturn(Optional.of(user));

        FaceVerifyRequest req = new FaceVerifyRequest();
        req.setEmail("voter@smartvote.ai");
        req.setLiveEmbedding(personAVector);
        req.setLivenessPassed(true);
        req.setBlinkDetected(false); // No blink recorded

        FaceMatchException ex = assertThrows(FaceMatchException.class, () -> {
            authService.verifyFace(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Natural eye blink not detected"), "Must flag missing eye blink");
    }

    @Test
    @DisplayName("AuthService.verifyFace: Missing head movement triggers Anti-Spoofing error")
    void testVerifyFaceHeadTurnMissingRejected() {
        User user = new User();
        user.setId(20L);
        user.setEmail("voter@smartvote.ai");
        user.setFullName("Rajesh Kumar Verma");

        when(userRepository.findByEmail("voter@smartvote.ai")).thenReturn(Optional.of(user));

        FaceVerifyRequest req = new FaceVerifyRequest();
        req.setEmail("voter@smartvote.ai");
        req.setLiveEmbedding(personAVector);
        req.setLivenessPassed(true);
        req.setBlinkDetected(true);
        req.setHeadTurnDetected(false); // No head movement recorded

        FaceMatchException ex = assertThrows(FaceMatchException.class, () -> {
            authService.verifyFace(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Natural 3D head movement not detected"), "Must flag missing head movement");
    }

    @Test
    @DisplayName("AuthService.verifyFace: Live face mismatch against database photo triggers error")
    void testVerifyFaceMismatchRejected() {
        User user = new User();
        user.setId(20L);
        user.setEmail("voter@smartvote.ai");
        user.setFullName("Rajesh Kumar Verma");
        user.setStatus(UserStatus.APPROVED);
        user.setFailedLoginAttempts(0);

        FaceEmbedding userFe = new FaceEmbedding(user, faceService.serializeEmbedding(personAVector), 0.98);

        when(userRepository.findByEmail("voter@smartvote.ai")).thenReturn(Optional.of(user));
        when(faceEmbeddingRepository.findByUserId(20L)).thenReturn(Optional.of(userFe));
        when(faceEmbeddingRepository.findAllWithUser()).thenReturn(List.of(userFe));

        FaceVerifyRequest req = new FaceVerifyRequest();
        req.setEmail("voter@smartvote.ai");
        req.setLiveEmbedding(personBVector); // Different face from database photo
        req.setLivenessPassed(true);
        req.setBlinkDetected(true);
        req.setHeadTurnDetected(true);

        FaceMatchException ex = assertThrows(FaceMatchException.class, () -> {
            authService.verifyFace(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Facial Verification Error"), "Must indicate database photo mismatch");
        assertTrue(ex.getMessage().contains("Rajesh Kumar Verma"), "Must mention the target citizen name");
    }

    @Test
    @DisplayName("AuthService.verifyFace: Live face matching a different citizen triggers Impersonation Alert")
    void testVerifyFaceImpersonationRejected() {
        User targetUser = new User();
        targetUser.setId(1L);
        targetUser.setEmail("victim@smartvote.ai");
        targetUser.setFullName("Victim Citizen");
        targetUser.setStatus(UserStatus.APPROVED);
        targetUser.setFailedLoginAttempts(0);

        User attackerUser = new User();
        attackerUser.setId(2L);
        attackerUser.setEmail("attacker@smartvote.ai");
        attackerUser.setFullName("Attacker Citizen");
        attackerUser.setVoterIdNumber("IND-DL-ATTACK");

        FaceEmbedding targetFe = new FaceEmbedding(targetUser, faceService.serializeEmbedding(personAVector), 0.98);
        FaceEmbedding attackerFe = new FaceEmbedding(attackerUser, faceService.serializeEmbedding(personBVector), 0.98);

        when(userRepository.findByEmail("victim@smartvote.ai")).thenReturn(Optional.of(targetUser));
        when(faceEmbeddingRepository.findByUserId(1L)).thenReturn(Optional.of(targetFe));
        when(faceEmbeddingRepository.findAllWithUser()).thenReturn(List.of(targetFe, attackerFe));

        FaceVerifyRequest req = new FaceVerifyRequest();
        req.setEmail("victim@smartvote.ai");
        req.setLiveEmbedding(personBVector); // Attacker scans their face while trying to log into Victim's account!
        req.setLivenessPassed(true);
        req.setBlinkDetected(true);
        req.setHeadTurnDetected(true);

        FaceMatchException ex = assertThrows(FaceMatchException.class, () -> {
            authService.verifyFace(req, "127.0.0.1", "JUnit-Agent");
        });

        assertTrue(ex.getMessage().contains("Impersonation Detected"), "Must flag impersonation alert");
        assertTrue(ex.getMessage().contains("Attacker Citizen"), "Must identify matching registered citizen");
        assertTrue(ex.getMessage().contains("IND-DL-ATTACK"), "Must specify attacker Voter ID");
    }

    @Test
    @DisplayName("AuthService.verifyFace: Success when liveness passes and face matches database photo")
    void testVerifyFaceSuccess() {
        User user = new User();
        user.setId(50L);
        user.setEmail("voter50@smartvote.ai");
        user.setFullName("Priya Sharma");
        user.setMobileNumber("+91-9123456789");
        user.setStatus(UserStatus.APPROVED);
        user.setFailedLoginAttempts(0);

        FaceEmbedding userFe = new FaceEmbedding(user, faceService.serializeEmbedding(personAVector), 0.99);

        when(userRepository.findByEmail("voter50@smartvote.ai")).thenReturn(Optional.of(user));
        when(faceEmbeddingRepository.findByUserId(50L)).thenReturn(Optional.of(userFe));
        when(otpService.generateAndSaveOtp(eq("voter50@smartvote.ai"), any())).thenReturn("789123");
        when(jwtService.generateTemporarySessionToken(eq("voter50@smartvote.ai"), eq("OTP_VERIFY"))).thenReturn("valid-session-jwt");

        FaceVerifyRequest req = new FaceVerifyRequest();
        req.setEmail("voter50@smartvote.ai");
        req.setLiveEmbedding(personAVector);
        req.setLivenessPassed(true);
        req.setBlinkDetected(true);
        req.setHeadTurnDetected(true);

        var response = authService.verifyFace(req, "127.0.0.1", "JUnit-Agent");
        assertNotNull(response);
        assertEquals("OTP_VERIFY", response.getNextStep());
        assertEquals("valid-session-jwt", response.getSessionToken());
    }
}
