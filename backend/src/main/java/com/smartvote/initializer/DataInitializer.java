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
import com.smartvote.repository.CandidateRepository;
import com.smartvote.repository.ElectionRepository;
import com.smartvote.repository.NotificationRepository;
import com.smartvote.repository.UserRepository;
import com.smartvote.repository.VoteRepository;
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
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final FaceService faceService;

    public DataInitializer(UserRepository userRepository,
                           ElectionRepository electionRepository,
                           CandidateRepository candidateRepository,
                           VoteRepository voteRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder,
                           FaceService faceService) {
        this.userRepository = userRepository;
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
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
        // Seed or Update Chief Election Commissioner / Admin
        userRepository.findByEmail("admin@smartvote.ai").ifPresentOrElse(admin -> {
            admin.setFullName("Chief Election Commissioner (Admin)");
            admin.setVoterIdNumber("ECI-HQ-ADM01");
            admin.setMobileNumber("+91-9876543210");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setStatus(UserStatus.APPROVED);
            admin.setFailedLoginAttempts(0);
            admin.setAccountLockedUntil(null);
            userRepository.save(admin);
            log.info("Updated Indian Election Commission Admin: admin@smartvote.ai (ECI-HQ-ADM01) / Admin@123");
        }, () -> {
            User admin = new User();
            admin.setFullName("Chief Election Commissioner (Admin)");
            admin.setEmail("admin@smartvote.ai");
            admin.setMobileNumber("+91-9876543210");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setStatus(UserStatus.APPROVED);
            admin.setVoterIdNumber("ECI-HQ-ADM01");
            admin.setMaskedAadhaar("XXXX-XXXX-9999");
            admin.setFaceImageUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
            admin.setFailedLoginAttempts(0);
            userRepository.save(admin);
            log.info("Initialized default Indian Election Commission Admin: admin@smartvote.ai / Admin@123");
        });

        // Seed or Update Sample Indian Citizen Voter
        userRepository.findByEmail("voter@smartvote.ai").ifPresentOrElse(voter -> {
            voter.setFullName("Rajesh Kumar Verma");
            voter.setVoterIdNumber("IND-DL-8941205");
            voter.setMobileNumber("+91-9876543211");
            voter.setPassword(passwordEncoder.encode("Voter@123"));
            voter.setStatus(UserStatus.APPROVED);
            voter.setFailedLoginAttempts(0);
            voter.setAccountLockedUntil(null);
            userRepository.save(voter);
            log.info("Updated Indian Citizen Voter: voter@smartvote.ai (IND-DL-8941205) / Voter@123");
        }, () -> {
            User voter = new User();
            voter.setFullName("Rajesh Kumar Verma");
            voter.setEmail("voter@smartvote.ai");
            voter.setMobileNumber("+91-9876543211");
            voter.setPassword(passwordEncoder.encode("Voter@123"));
            voter.setRole(Role.ROLE_VOTER);
            voter.setStatus(UserStatus.APPROVED);
            voter.setVoterIdNumber("IND-DL-8941205");
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

            // Welcome notification in official ECI context
            notificationRepository.save(new Notification(savedVoter, "Digital Voter Identity Verified (EPIC: IND-DL-8941205)",
                    "Your citizen identity has been authenticated with facial security by the Election Commission of India. You may participate in active parliamentary and assembly ballots.",
                    NotificationType.SUCCESS));

            log.info("Initialized default Indian Citizen Voter: voter@smartvote.ai / Voter@123 (EPIC: IND-DL-8941205)");
        });
    }

    private void seedElections() {
        List<Election> existing = electionRepository.findAll();

        // Purge any legacy non-Indian elections so only authentic Indian elections exist
        for (Election el : existing) {
            if (el.getTitle() != null && !el.getTitle().contains("Lok Sabha") && !el.getTitle().contains("Vidhan Sabha") && !el.getTitle().contains("Municipal Corporation") && !el.getTitle().contains("Rajya Sabha")) {
                log.info("Purging legacy non-Indian election: [{}] (id: {})", el.getTitle(), el.getId());
                try {
                    electionRepository.deleteVotesByElectionId(el.getId());
                    electionRepository.deleteCandidatesByElectionId(el.getId());
                    electionRepository.deleteElectionByIdDirect(el.getId());
                    log.info("Purged legacy non-Indian election id: {}", el.getId());
                } catch (Exception ex) {
                    log.warn("Could not delete legacy election {}: {}", el.getId(), ex.getMessage());
                }
            } else if (el.getTitle() != null && el.getTitle().contains("Municipal Corporation")) {
                // Ensure Municipal Corporation (Nagar Nigam) is ACTIVE
                el.setTitle("Greater Municipal Corporation Civic Council 2026 (Nagar Nigam)");
                el.setStatus(ElectionStatus.ACTIVE);
                el.setStartDate(LocalDateTime.now().minusDays(1));
                el.setEndDate(LocalDateTime.now().plusDays(10));
                electionRepository.save(el);
            }
        }

        boolean hasIndian = electionRepository.findAll().stream().anyMatch(e -> e.getTitle() != null && e.getTitle().contains("Lok Sabha"));

        if (!hasIndian) {
            log.info("Seeding authentic Indian democratic elections (Lok Sabha, Vidhan Sabha, Nagar Nigam, Rajya Sabha)...");

            // Election 1: Active - 18th Lok Sabha General Elections
            Election election1 = new Election();
            election1.setTitle("18th Lok Sabha General Elections 2026");
            election1.setDescription("Elect Member of Parliament (MP) representing the New Delhi Parliamentary Constituency. Voting is conducted under the constitutional supervision of the Election Commission of India with strict Article 324 secret ballot guarantees.");
            election1.setCategory("Parliamentary (Lok Sabha)");
            election1.setBannerUrl("https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80");
            election1.setStartDate(LocalDateTime.now().minusDays(1));
            election1.setEndDate(LocalDateTime.now().plusDays(14));
            election1.setStatus(ElectionStatus.ACTIVE);
            election1.setTotalVotes(0);

            Candidate c1 = new Candidate(
                    "Rajeshwar Nath Sharma",
                    "Bharatiya Janata Party (BJP)",
                    "🪷",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                    "Committed to national infrastructure modernization, digital public goods, zero corruption, and technological self-reliance."
            );
            election1.addCandidate(c1);

            Candidate c2 = new Candidate(
                    "Priya R. Patel",
                    "Indian National Congress (INC)",
                    "✋",
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
                    "Championing universal social safety nets, quality education access, youth employment guarantees, and constitutional institutional integrity."
            );
            election1.addCandidate(c2);

            Candidate c3 = new Candidate(
                    "Arvind Mohan Saxena",
                    "Aam Aadmi Party (AAP)",
                    "🧹",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                    "Focusing on high-standard government schools, neighborhood health clinics, 24/7 clean water access, and administrative transparency."
            );
            election1.addCandidate(c3);

            Candidate c4 = new Candidate(
                    "Anand Devraj Kumar",
                    "Bahujan Samaj Party (BSP)",
                    "🐘",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
                    "Advocating for social justice, equitable empowerment of marginalized communities, and comprehensive legal welfare protections."
            );
            election1.addCandidate(c4);

            electionRepository.save(election1);

            // Election 2: Active - State Legislative Assembly (Vidhan Sabha)
            Election election2 = new Election();
            election2.setTitle("State Legislative Assembly Election 2026 (Vidhan Sabha)");
            election2.setDescription("Elect Member of the Legislative Assembly (MLA) for Bengaluru South / Metro State Constituency to oversee state legislation, urban transit networks, public infrastructure, and citizen services.");
            election2.setCategory("State Assembly (Vidhan Sabha)");
            election2.setBannerUrl("https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80");
            election2.setStartDate(LocalDateTime.now().minusDays(2));
            election2.setEndDate(LocalDateTime.now().plusDays(7));
            election2.setStatus(ElectionStatus.ACTIVE);
            election2.setTotalVotes(0);

            Candidate c5 = new Candidate(
                    "Dr. K. Venkat Reddy",
                    "Rashtriya Pragati Front (RPF)",
                    "🚜",
                    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
                    "Promoting agricultural technology modernization, rural-urban connectivity, and fair farmer price realization."
            );
            election2.addCandidate(c5);

            Candidate c6 = new Candidate(
                    "Anita S. Deshmukh",
                    "Lok Seva Morcha (LSM)",
                    "☀️",
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
                    "Dedicated to women's financial independence, renewable solar micro-grids, and decentralized urban planning."
            );
            election2.addCandidate(c6);

            Candidate c7 = new Candidate(
                    "Mohammad Farooq",
                    "Samyukta Jan Kalyan Party",
                    "🪁",
                    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
                    "Pioneering youth vocational skilling centers, free public library hubs, and inclusive civic community centers."
            );
            election2.addCandidate(c7);

            electionRepository.save(election2);

            // Election 3: Active - Greater Municipal Corporation (Nagar Nigam)
            Election election3 = new Election();
            election3.setTitle("Greater Municipal Corporation Civic Council 2026");
            election3.setDescription("Elect Ward Councillor to the Municipal Corporation (Nagar Nigam) governing neighborhood public sanitation, stormwater drainage, local health centers, and smart street lighting.");
            election3.setCategory("Municipal Corporation (Nagar Nigam)");
            election3.setBannerUrl("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80");
            election3.setStartDate(LocalDateTime.now().minusDays(1));
            election3.setEndDate(LocalDateTime.now().plusDays(5));
            election3.setStatus(ElectionStatus.ACTIVE);
            election3.setTotalVotes(0);

            Candidate c8 = new Candidate(
                    "Suresh Chander Gupta",
                    "Citizens Civic Council",
                    "💧",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
                    "Ensuring 24/7 piped drinking water to all households, automated sewer desilting, and zero monsoon waterlogging."
            );
            election3.addCandidate(c8);

            Candidate c9 = new Candidate(
                    "Kavita Nambiar",
                    "Clean City Alliance",
                    "🌳",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                    "Prioritizing municipal waste segregation, neighborhood public parks, and zero-emission electric civic transit."
            );
            election3.addCandidate(c9);

            electionRepository.save(election3);

            // Election 4: Upcoming - Council of States (Rajya Sabha)
            Election election4 = new Election();
            election4.setTitle("Council of States Biennial Election 2027 (Rajya Sabha)");
            election4.setDescription("Biennial elections for the Council of States (Rajya Sabha) representing states and union territories in the Parliament of India.");
            election4.setCategory("Parliamentary (Rajya Sabha)");
            election4.setBannerUrl("https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80");
            election4.setStartDate(LocalDateTime.now().plusDays(30));
            election4.setEndDate(LocalDateTime.now().plusDays(60));
            election4.setStatus(ElectionStatus.UPCOMING);
            election4.setTotalVotes(0);

            electionRepository.save(election4);

            log.info("Initialized authentic Indian democratic seed elections, candidates, and symbols.");
        }
    }
}
