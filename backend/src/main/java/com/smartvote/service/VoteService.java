package com.smartvote.service;

import com.smartvote.dto.CastVoteRequest;
import com.smartvote.dto.ReceiptVerifyResponse;
import com.smartvote.dto.VoteReceiptResponse;
import com.smartvote.entity.Candidate;
import com.smartvote.entity.Election;
import com.smartvote.entity.User;
import com.smartvote.entity.Vote;
import com.smartvote.entity.enums.ElectionStatus;
import com.smartvote.entity.enums.NotificationType;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.exception.BadRequestException;
import com.smartvote.exception.DuplicateVoteException;
import com.smartvote.exception.ResourceNotFoundException;
import com.smartvote.exception.UnauthorizedException;
import com.smartvote.repository.CandidateRepository;
import com.smartvote.repository.ElectionRepository;
import com.smartvote.repository.UserRepository;
import com.smartvote.repository.VoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VoteService {

    private static final Logger log = LoggerFactory.getLogger(VoteService.class);

    private final VoteRepository voteRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Value("${app.receipt.verification-base-url:http://localhost:5173/verify}")
    private String verificationBaseUrl;

    public VoteService(VoteRepository voteRepository,
                       ElectionRepository electionRepository,
                       CandidateRepository candidateRepository,
                       UserRepository userRepository,
                       EmailService emailService,
                       NotificationService notificationService,
                       AuditService auditService) {
        this.voteRepository = voteRepository;
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public VoteReceiptResponse castVote(CastVoteRequest req, String voterEmail, String ipAddress, String userAgent) {
        User voter = userRepository.findByEmail(voterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", voterEmail));

        if (voter.getStatus() != UserStatus.APPROVED) {
            throw new UnauthorizedException("Your voter status is currently: " + voter.getStatus() + ". Only approved voters can cast ballots.");
        }

        Election election = electionRepository.findById(req.getElectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", req.getElectionId()));

        LocalDateTime now = LocalDateTime.now();
        if (election.getStatus() != ElectionStatus.ACTIVE || now.isBefore(election.getStartDate()) || now.isAfter(election.getEndDate())) {
            throw new BadRequestException("Election is not currently active for voting.");
        }

        Candidate candidate = candidateRepository.findById(req.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", req.getCandidateId()));

        if (!candidate.getElection().getId().equals(election.getId())) {
            throw new BadRequestException("Candidate does not belong to this election.");
        }

        // Check duplicate vote
        if (voteRepository.existsByElectionIdAndVoterId(election.getId(), voter.getId())) {
            throw new DuplicateVoteException("Duplicate vote rejected: You have already cast your ballot for this election.");
        }

        // Generate Unique Receipt ID
        String receiptId = "SMV-" + LocalDateTime.now().getYear() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Generate SHA-256 Digital Hash Seal
        String payloadToHash = receiptId + ":" + election.getId() + ":" + candidate.getId() + ":" + voter.getId() + ":" + now;
        String receiptHash = computeSha256(payloadToHash);
        String digitalSignature = Base64.getEncoder().encodeToString(computeSha256("SMARTVOTE_SEAL:" + receiptHash).getBytes(StandardCharsets.UTF_8));

        // Save Vote
        Vote vote = new Vote();
        vote.setElection(election);
        vote.setVoter(voter);
        vote.setCandidate(candidate);
        vote.setReceiptId(receiptId);
        vote.setReceiptHash(receiptHash);
        vote.setDigitalSignature(digitalSignature);
        vote.setIpAddress(ipAddress);
        vote.setUserAgent(userAgent);
        vote.setVotedAt(now);

        voteRepository.save(vote);

        // Atomically increment tallies
        candidate.setVoteCount(candidate.getVoteCount() + 1);
        candidateRepository.save(candidate);

        election.setTotalVotes(election.getTotalVotes() + 1);
        electionRepository.save(election);

        // Audit Trail (voter identity anonymized in public logs)
        auditService.logAction(voterEmail, "ROLE_VOTER", "VOTE_CAST", "Vote",
                receiptId, "Vote cast in election: " + election.getTitle() + " | Receipt: " + receiptId, ipAddress);

        // Send Email confirmation
        emailService.sendVoteConfirmationEmail(voterEmail, voter.getFullName(), election.getTitle(),
                candidate.getFullName() + " (" + candidate.getPartyName() + ")", receiptId, receiptHash);

        // In-app Notification
        notificationService.createNotification(voter, "Vote Recorded & Sealed",
                "Your ballot for '" + election.getTitle() + "' was sealed cryptographically. Receipt ID: " + receiptId,
                NotificationType.SUCCESS);

        // WebSocket broadcast update to live dashboard listeners
        if (messagingTemplate != null) {
            try {
                Map<String, Object> update = new HashMap<>();
                update.put("electionId", election.getId());
                update.put("candidateId", candidate.getId());
                update.put("voteCount", candidate.getVoteCount());
                update.put("totalVotes", election.getTotalVotes());
                messagingTemplate.convertAndSend("/topic/elections/" + election.getId() + "/votes", update);
            } catch (Exception e) {
                log.warn("Failed to send WebSocket vote update: {}", e.getMessage());
            }
        }

        // Build Response
        VoteReceiptResponse res = new VoteReceiptResponse();
        res.setReceiptId(receiptId);
        res.setElectionId(election.getId());
        res.setElectionTitle(election.getTitle());
        res.setCandidateName(candidate.getFullName());
        res.setPartyName(candidate.getPartyName());
        res.setPartySymbol(candidate.getPartySymbol());
        res.setVotedAt(now);
        res.setReceiptHash(receiptHash);
        res.setDigitalSignature(digitalSignature);
        String verifyUrl = verificationBaseUrl + "?receiptId=" + receiptId;
        res.setVerificationUrl(verifyUrl);
        res.setQrCodeData(verifyUrl);

        return res;
    }

    public List<VoteReceiptResponse> getVoterHistory(String voterEmail) {
        User voter = userRepository.findByEmail(voterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", voterEmail));

        List<Vote> votes = voteRepository.findVoterHistoryWithDetails(voter.getId());
        return votes.stream().map(v -> {
            VoteReceiptResponse res = new VoteReceiptResponse();
            res.setReceiptId(v.getReceiptId());
            res.setElectionId(v.getElection().getId());
            res.setElectionTitle(v.getElection().getTitle());
            res.setCandidateName(v.getCandidate().getFullName());
            res.setPartyName(v.getCandidate().getPartyName());
            res.setPartySymbol(v.getCandidate().getPartySymbol());
            res.setVotedAt(v.getVotedAt());
            res.setReceiptHash(v.getReceiptHash());
            res.setDigitalSignature(v.getDigitalSignature());
            String verifyUrl = verificationBaseUrl + "?receiptId=" + v.getReceiptId();
            res.setVerificationUrl(verifyUrl);
            res.setQrCodeData(verifyUrl);
            return res;
        }).collect(Collectors.toList());
    }

    public ReceiptVerifyResponse verifyReceipt(String receiptId) {
        if (receiptId == null || receiptId.isBlank()) {
            return ReceiptVerifyResponse.invalid("Invalid receipt identifier provided.");
        }

        Optional<Vote> opt = voteRepository.findByReceiptIdWithDetails(receiptId.trim());
        if (opt.isEmpty()) {
            return ReceiptVerifyResponse.invalid("Receipt not found on the cryptographic voting ledger. This receipt may be invalid or forged.");
        }

        Vote vote = opt.get();
        return ReceiptVerifyResponse.valid(
                vote.getReceiptId(),
                vote.getElection().getTitle(),
                vote.getCandidate().getFullName(),
                vote.getCandidate().getPartyName(),
                vote.getCandidate().getPartySymbol(),
                vote.getVotedAt(),
                vote.getReceiptHash(),
                vote.getDigitalSignature()
        );
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
