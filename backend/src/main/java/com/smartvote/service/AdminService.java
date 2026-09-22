package com.smartvote.service;

import com.smartvote.dto.*;
import com.smartvote.entity.Candidate;
import com.smartvote.entity.Election;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.ElectionStatus;
import com.smartvote.entity.enums.LoginStatus;
import com.smartvote.entity.enums.Role;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.exception.ResourceNotFoundException;
import com.smartvote.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;

    public AdminService(UserRepository userRepository,
                        ElectionRepository electionRepository,
                        CandidateRepository candidateRepository,
                        VoteRepository voteRepository,
                        LoginHistoryRepository loginHistoryRepository,
                        AuditLogRepository auditLogRepository,
                        AuditService auditService) {
        this.userRepository = userRepository;
        this.electionRepository = electionRepository;
        this.candidateRepository = candidateRepository;
        this.voteRepository = voteRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditService = auditService;
    }

    public DashboardAnalyticsResponse getDashboardAnalytics() {
        DashboardAnalyticsResponse res = new DashboardAnalyticsResponse();

        long totalVoters = userRepository.countByRole(Role.ROLE_VOTER);
        long approvedVoters = userRepository.countByRoleAndStatus(Role.ROLE_VOTER, UserStatus.APPROVED);
        long pendingVoters = userRepository.countByRoleAndStatus(Role.ROLE_VOTER, UserStatus.PENDING);
        long lockedVoters = userRepository.countByRoleAndStatus(Role.ROLE_VOTER, UserStatus.LOCKED);
        long activeElections = electionRepository.countByStatus(ElectionStatus.ACTIVE);
        long totalVotes = voteRepository.count();

        long suspiciousLogins = loginHistoryRepository.countByStatus(LoginStatus.FAILED_FACE) +
                               loginHistoryRepository.countByStatus(LoginStatus.LOCKED);

        double turnout = (approvedVoters > 0) ? Math.min(100.0, (double) totalVotes / approvedVoters * 100.0) : 0.0;

        res.setTotalRegisteredVoters(totalVoters);
        res.setTotalApprovedVoters(approvedVoters);
        res.setTotalPendingVoters(pendingVoters);
        res.setTotalLockedVoters(lockedVoters);
        res.setTotalVotesCast(totalVotes);
        res.setActiveElectionsCount(activeElections);
        res.setSuspiciousLoginsCount(suspiciousLogins);
        res.setTurnoutPercentage(Math.round(turnout * 10.0) / 10.0);

        // Hourly voting trends (last 24 hours)
        LocalDateTime since24Hours = LocalDateTime.now().minusHours(24);
        List<Object[]> hourlyData = voteRepository.getHourlyVoteCounts(since24Hours);
        List<HourlyVoteDto> hourlyDtos = new ArrayList<>();
        for (Object[] row : hourlyData) {
            int hr = ((Number) row[0]).intValue();
            long cnt = ((Number) row[1]).longValue();
            hourlyDtos.add(new HourlyVoteDto(hr, cnt));
        }
        res.setHourlyVotes(hourlyDtos);

        // Candidate vote distribution across active/recent elections
        List<CandidateDistributionDto> candidateDist = new ArrayList<>();
        List<Election> elections = electionRepository.findAll();
        for (Election el : elections) {
            for (Candidate cand : el.getCandidates()) {
                double pct = (el.getTotalVotes() > 0) ? ((double) cand.getVoteCount() / el.getTotalVotes()) * 100.0 : 0.0;
                candidateDist.add(new CandidateDistributionDto(
                        cand.getId(),
                        cand.getFullName(),
                        cand.getPartyName(),
                        cand.getPartySymbol(),
                        el.getId(),
                        el.getTitle(),
                        cand.getVoteCount(),
                        Math.round(pct * 10.0) / 10.0
                ));
            }
        }
        res.setCandidateVoteDistribution(candidateDist);

        // Recent Audit Activities
        List<AuditLogDto> auditDtos = auditLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .limit(10)
                .map(AuditLogDto::fromEntity)
                .collect(Collectors.toList());
        res.setRecentActivities(auditDtos);

        return res;
    }

    public List<UserDto> searchVoters(String keyword, UserStatus status) {
        List<User> list;
        if (keyword != null && !keyword.isBlank()) {
            list = userRepository.searchVoters(keyword.trim());
        } else if (status != null) {
            list = userRepository.findByStatus(status);
        } else {
            list = userRepository.findByRole(Role.ROLE_VOTER);
        }

        return list.stream().map(UserDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateVoterStatus(Long voterId, UserStatus status, String reason, String adminEmail) {
        User voter = userRepository.findById(voterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", voterId));

        UserStatus oldStatus = voter.getStatus();
        voter.setStatus(status);
        if (status == UserStatus.APPROVED || status == UserStatus.PENDING) {
            voter.setFailedLoginAttempts(0);
            voter.setAccountLockedUntil(null);
        }
        User saved = userRepository.save(voter);

        auditService.logAction(adminEmail, "ROLE_ADMIN", "VOTER_STATUS_UPDATE", "User",
                String.valueOf(voterId), "Changed status from " + oldStatus + " to " + status + ". Reason: " + reason, "Local");

        return UserDto.fromEntity(saved);
    }

    public List<AuditLogDto> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .map(AuditLogDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<LoginHistoryDto> getLoginHistories() {
        return loginHistoryRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(LoginHistoryDto::fromEntity)
                .collect(Collectors.toList());
    }

    public String exportAuditCsv() {
        List<AuditLogDto> logs = getAuditLogs();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Timestamp,Actor,Role,Action,EntityType,EntityID,IP,Details\n");
        for (AuditLogDto l : logs) {
            csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    l.getId(), l.getTimestamp(), l.getActorEmail(), l.getActorRole(), l.getAction(),
                    l.getEntityType(), l.getEntityId(), l.getIpAddress(),
                    l.getDetails() != null ? l.getDetails().replace("\"", "'") : ""));
        }
        return csv.toString();
    }
}
