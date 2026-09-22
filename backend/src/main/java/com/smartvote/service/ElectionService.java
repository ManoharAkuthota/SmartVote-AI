package com.smartvote.service;

import com.smartvote.dto.CandidateDto;
import com.smartvote.dto.CandidateRequest;
import com.smartvote.dto.ElectionDto;
import com.smartvote.dto.ElectionRequest;
import com.smartvote.entity.Candidate;
import com.smartvote.entity.Election;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.ElectionStatus;
import com.smartvote.exception.BadRequestException;
import com.smartvote.exception.ResourceNotFoundException;
import com.smartvote.repository.CandidateRepository;
import com.smartvote.repository.ElectionRepository;
import com.smartvote.repository.UserRepository;
import com.smartvote.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ElectionService(ElectionRepository electionRepository,
                           CandidateRepository candidateRepository,
                           VoteRepository voteRepository,
                           UserRepository userRepository,
                           AuditService auditService) {
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public List<ElectionDto> getAllElections(String userEmail) {
        User user = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
        List<Election> elections = electionRepository.findAllByOrderByCreatedAtDesc();

        return elections.stream().map(e -> {
            refreshStatus(e);
            boolean hasVoted = user != null && voteRepository.existsByElectionIdAndVoterId(e.getId(), user.getId());
            boolean showVoteCounts = (user != null && user.getRole().name().equals("ROLE_ADMIN")) || e.getStatus() == ElectionStatus.COMPLETED;
            return ElectionDto.fromEntity(e, showVoteCounts, hasVoted);
        }).collect(Collectors.toList());
    }

    public List<ElectionDto> getActiveElections(String userEmail) {
        User user = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
        List<Election> elections = electionRepository.findByStatus(ElectionStatus.ACTIVE);

        return elections.stream().map(e -> {
            boolean hasVoted = user != null && voteRepository.existsByElectionIdAndVoterId(e.getId(), user.getId());
            boolean showVoteCounts = user != null && user.getRole().name().equals("ROLE_ADMIN");
            return ElectionDto.fromEntity(e, showVoteCounts, hasVoted);
        }).collect(Collectors.toList());
    }

    public List<ElectionDto> getUpcomingElections() {
        return electionRepository.findByStatus(ElectionStatus.UPCOMING).stream()
                .map(e -> ElectionDto.fromEntity(e, false, false))
                .collect(Collectors.toList());
    }

    public ElectionDto getElectionById(Long id, String userEmail) {
        Election election = electionRepository.findByIdWithCandidates(id)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", id));
        refreshStatus(election);

        User user = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
        boolean hasVoted = user != null && voteRepository.existsByElectionIdAndVoterId(election.getId(), user.getId());
        boolean showVoteCounts = (user != null && user.getRole().name().equals("ROLE_ADMIN")) || election.getStatus() == ElectionStatus.COMPLETED;

        return ElectionDto.fromEntity(election, showVoteCounts, hasVoted);
    }

    @Transactional
    public ElectionDto createElection(ElectionRequest req, String adminEmail) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BadRequestException("Election end date must be after the start date");
        }

        Election election = new Election();
        election.setTitle(req.getTitle().trim());
        election.setDescription(req.getDescription());
        election.setCategory(req.getCategory() != null ? req.getCategory() : "General Assembly");
        election.setBannerUrl(req.getBannerUrl());
        election.setStartDate(req.getStartDate());
        election.setEndDate(req.getEndDate());

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(req.getStartDate())) {
            election.setStatus(ElectionStatus.UPCOMING);
        } else if (now.isAfter(req.getEndDate())) {
            election.setStatus(ElectionStatus.COMPLETED);
        } else {
            election.setStatus(ElectionStatus.ACTIVE);
        }

        Election saved = electionRepository.save(election);
        auditService.logAction(adminEmail, "ROLE_ADMIN", "CREATE_ELECTION", "Election",
                String.valueOf(saved.getId()), "Created election: " + saved.getTitle(), "Local");

        return ElectionDto.fromEntity(saved, true, false);
    }

    @Transactional
    public ElectionDto updateElection(Long id, ElectionRequest req, String adminEmail) {
        Election election = electionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", id));

        election.setTitle(req.getTitle().trim());
        election.setDescription(req.getDescription());
        if (req.getCategory() != null) election.setCategory(req.getCategory());
        if (req.getBannerUrl() != null) election.setBannerUrl(req.getBannerUrl());
        election.setStartDate(req.getStartDate());
        election.setEndDate(req.getEndDate());
        if (req.getStatus() != null) {
            election.setStatus(req.getStatus());
        } else {
            refreshStatus(election);
        }

        Election saved = electionRepository.save(election);
        auditService.logAction(adminEmail, "ROLE_ADMIN", "UPDATE_ELECTION", "Election",
                String.valueOf(saved.getId()), "Updated election details: " + saved.getTitle(), "Local");

        return ElectionDto.fromEntity(saved, true, false);
    }

    @Transactional
    public void deleteElection(Long id, String adminEmail) {
        Election election = electionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", id));

        auditService.logAction(adminEmail, "ROLE_ADMIN", "DELETE_ELECTION", "Election",
                String.valueOf(id), "Deleted election: " + election.getTitle(), "Local");
        electionRepository.delete(election);
    }

    @Transactional
    public CandidateDto addCandidate(Long electionId, CandidateRequest req, String adminEmail) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election", "id", electionId));

        Candidate candidate = new Candidate();
        candidate.setElection(election);
        candidate.setFullName(req.getFullName().trim());
        candidate.setPartyName(req.getPartyName().trim());
        candidate.setPartySymbol(req.getPartySymbol());
        candidate.setPhotoUrl(req.getPhotoUrl());
        candidate.setManifesto(req.getManifesto());
        candidate.setVoteCount(0);

        Candidate saved = candidateRepository.save(candidate);
        election.getCandidates().add(saved);

        auditService.logAction(adminEmail, "ROLE_ADMIN", "ADD_CANDIDATE", "Candidate",
                String.valueOf(saved.getId()), "Added candidate " + saved.getFullName() + " to election " + election.getTitle(), "Local");

        return CandidateDto.fromEntity(saved, true);
    }

    @Transactional
    public CandidateDto updateCandidate(Long candidateId, CandidateRequest req, String adminEmail) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        candidate.setFullName(req.getFullName().trim());
        candidate.setPartyName(req.getPartyName().trim());
        if (req.getPartySymbol() != null) candidate.setPartySymbol(req.getPartySymbol());
        if (req.getPhotoUrl() != null) candidate.setPhotoUrl(req.getPhotoUrl());
        if (req.getManifesto() != null) candidate.setManifesto(req.getManifesto());

        Candidate saved = candidateRepository.save(candidate);
        auditService.logAction(adminEmail, "ROLE_ADMIN", "UPDATE_CANDIDATE", "Candidate",
                String.valueOf(saved.getId()), "Updated candidate: " + saved.getFullName(), "Local");

        return CandidateDto.fromEntity(saved, true);
    }

    @Transactional
    public void deleteCandidate(Long candidateId, String adminEmail) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        auditService.logAction(adminEmail, "ROLE_ADMIN", "DELETE_CANDIDATE", "Candidate",
                String.valueOf(candidateId), "Removed candidate: " + candidate.getFullName(), "Local");
        candidateRepository.delete(candidate);
    }

    private void refreshStatus(Election election) {
        LocalDateTime now = LocalDateTime.now();
        if (election.getStatus() != ElectionStatus.CANCELLED) {
            if (now.isBefore(election.getStartDate())) {
                election.setStatus(ElectionStatus.UPCOMING);
            } else if (now.isAfter(election.getEndDate())) {
                election.setStatus(ElectionStatus.COMPLETED);
            } else {
                election.setStatus(ElectionStatus.ACTIVE);
            }
        }
    }
}
