package com.smartvote.initializer;

import com.smartvote.entity.Candidate;
import com.smartvote.entity.Election;
import com.smartvote.entity.FaceEmbedding;
import com.smartvote.entity.Notification;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.ElectionStatus;
import com.smartvote.entity.enums.NotificationType;
import com.smartvote.entity.enums.Role;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.repository.ElectionRepository;
import com.smartvote.repository.NotificationRepository;
import com.smartvote.repository.UserRepository;
import com.smartvote.service.FaceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ElectionRepository electionRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final FaceService faceService;

    public DataInitializer(UserRepository userRepository,
                           ElectionRepository electionRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder,
                           FaceService faceService) {
        this.userRepository = userRepository;
        this.electionRepository = electionRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.faceService = faceService;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedElections();
    }

    private void seedUsers() {
        // Seed Admin if not present
        if (userRepository.findByEmail("admin@smartvote.ai").isEmpty()) {
            User admin = new User();
            admin.setFullName("System Administrator");
            admin.setEmail("admin@smartvote.ai");
            admin.setMobileNumber("+1-555-0199");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setStatus(UserStatus.APPROVED);
            admin.setVoterIdNumber("SMV-ADMIN-001");
            admin.setMaskedAadhaar("XXXX-XXXX-9999");
            admin.setFaceImageUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
            admin.setFailedLoginAttempts(0);
            userRepository.save(admin);
            log.info("Initialized default Admin: admin@smartvote.ai / Admin@123");
        }

        // Seed Sample Voter if not present
        if (userRepository.findByEmail("voter@smartvote.ai").isEmpty()) {
            User voter = new User();
            voter.setFullName("Alex Reynolds");
            voter.setEmail("voter@smartvote.ai");
            voter.setMobileNumber("+1-555-0144");
            voter.setPassword(passwordEncoder.encode("Voter@123"));
            voter.setRole(Role.ROLE_VOTER);
            voter.setStatus(UserStatus.APPROVED);
            voter.setVoterIdNumber("SMV-8941205");
            voter.setMaskedAadhaar("XXXX-XXXX-4589");
            voter.setFaceImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80");
            voter.setFailedLoginAttempts(0);

            // Generate sample normalized 128-dimensional embedding
            List<Double> sampleVector = new ArrayList<>(128);
            for (int i = 0; i < 128; i++) {
                sampleVector.add(0.05 + (i % 7) * 0.02);
            }
            FaceEmbedding embedding = new FaceEmbedding(voter, faceService.serializeEmbedding(sampleVector), 0.98);
            voter.setFaceEmbedding(embedding);

            User savedVoter = userRepository.save(voter);

            // Welcome notification
            notificationRepository.save(new Notification(savedVoter, "Digital Voter Identity Verified",
                    "Your biometric demo identity is authenticated. You may participate in active elections.",
                    NotificationType.SUCCESS));

            log.info("Initialized default Voter: voter@smartvote.ai / Voter@123");
        }
    }

    private void seedElections() {
        if (electionRepository.count() == 0) {
            // Election 1: Active
            Election election1 = new Election();
            election1.setTitle("2026 Global AI Governance & Ethics Council");
            election1.setDescription("Determine international policy directives on autonomous agent safety, frontier foundation model standards, and zero-knowledge privacy guarantees across digital elections.");
            election1.setCategory("Technology & Governance");
            election1.setBannerUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80");
            election1.setStartDate(LocalDateTime.now().minusDays(1));
            election1.setEndDate(LocalDateTime.now().plusDays(14));
            election1.setStatus(ElectionStatus.ACTIVE);
            election1.setTotalVotes(0);

            Candidate c1 = new Candidate(
                    "Dr. Elena Rostova",
                    "Open Intelligence Coalition",
                    "🌐",
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
                    "Advocating for fully auditable open-weight neural systems and public compute infrastructure grants."
            );
            election1.addCandidate(c1);

            Candidate c2 = new Candidate(
                    "Marcus Vance",
                    "Cyber Sovereignty Alliance",
                    "🛡️",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                    "Championing resilient sovereign cryptography, real-time threat neutralization, and strict data localization."
            );
            election1.addCandidate(c2);

            Candidate c3 = new Candidate(
                    "Priya Sharma",
                    "Digital Ethics & Human Rights",
                    "⚖️",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
                    "Pioneering algorithmic fairness standards, bias remediation, and inclusive global civic engagement."
            );
            election1.addCandidate(c3);

            electionRepository.save(election1);

            // Election 2: Active
            Election election2 = new Election();
            election2.setTitle("National Smart City & Infrastructure Assembly 2026");
            election2.setDescription("Elect representatives overseeing high-speed sustainable transportation networks, renewable smart grids, and citizen biometric data sovereignty.");
            election2.setCategory("Civic Infrastructure");
            election2.setBannerUrl("https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80");
            election2.setStartDate(LocalDateTime.now().minusDays(2));
            election2.setEndDate(LocalDateTime.now().plusDays(7));
            election2.setStatus(ElectionStatus.ACTIVE);
            election2.setTotalVotes(0);

            Candidate c4 = new Candidate(
                    "David Chen",
                    "Green Urban Tech",
                    "🌿",
                    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
                    "Decarbonizing city transit through distributed solar canopy networks and zero-emission transit."
            );
            election2.addCandidate(c4);

            Candidate c5 = new Candidate(
                    "Sophia Al-Mansoor",
                    "Connected Metro Initiative",
                    "⚡",
                    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
                    "Building resilient municipal broadband, edge IoT sensor mesh, and responsive civic services."
            );
            election2.addCandidate(c5);

            electionRepository.save(election2);

            // Election 3: Upcoming
            Election election3 = new Election();
            election3.setTitle("Global Quantum Standards & Cryptographic Council 2027");
            election3.setDescription("Setting global protocols for post-quantum lattice cryptography, quantum key distribution, and security certification standards.");
            election3.setCategory("Scientific Governance");
            election3.setBannerUrl("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80");
            election3.setStartDate(LocalDateTime.now().plusDays(30));
            election3.setEndDate(LocalDateTime.now().plusDays(60));
            election3.setStatus(ElectionStatus.UPCOMING);
            election3.setTotalVotes(0);

            electionRepository.save(election3);

            log.info("Initialized default seed elections and candidates.");
        }
    }
}
