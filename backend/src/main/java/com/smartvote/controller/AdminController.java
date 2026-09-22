package com.smartvote.controller;

import com.smartvote.dto.*;
import com.smartvote.entity.enums.UserStatus;
import com.smartvote.service.AdminService;
import com.smartvote.service.ElectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ElectionService electionService;

    public AdminController(AdminService adminService, ElectionService electionService) {
        this.adminService = adminService;
        this.electionService = electionService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getAnalytics() {
        DashboardAnalyticsResponse analytics = adminService.getDashboardAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    // Voter Management
    @GetMapping("/voters")
    public ResponseEntity<ApiResponse<List<UserDto>>> getVoters(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status) {
        List<UserDto> voters = adminService.searchVoters(keyword, status);
        return ResponseEntity.ok(ApiResponse.success(voters));
    }

    @PatchMapping("/voters/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateVoterStatus(
            @PathVariable Long id,
            @Valid @RequestBody VoterStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        UserDto updated = adminService.updateVoterStatus(id, request.getStatus(), request.getReason(), adminEmail);
        return ResponseEntity.ok(ApiResponse.success("Voter status updated to " + request.getStatus(), updated));
    }

    // Election Management
    @PostMapping("/elections")
    public ResponseEntity<ApiResponse<ElectionDto>> createElection(
            @Valid @RequestBody ElectionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        ElectionDto created = electionService.createElection(request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Election created successfully", created));
    }

    @PutMapping("/elections/{id}")
    public ResponseEntity<ApiResponse<ElectionDto>> updateElection(
            @PathVariable Long id,
            @Valid @RequestBody ElectionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        ElectionDto updated = electionService.updateElection(id, request, adminEmail);
        return ResponseEntity.ok(ApiResponse.success("Election updated successfully", updated));
    }

    @DeleteMapping("/elections/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteElection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        electionService.deleteElection(id, adminEmail);
        return ResponseEntity.ok(ApiResponse.success("Election deleted successfully", null));
    }

    // Candidate Management
    @PostMapping("/elections/{id}/candidates")
    public ResponseEntity<ApiResponse<CandidateDto>> addCandidate(
            @PathVariable Long id,
            @Valid @RequestBody CandidateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        CandidateDto candidate = electionService.addCandidate(id, request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Candidate added successfully", candidate));
    }

    @PutMapping("/candidates/{candidateId}")
    public ResponseEntity<ApiResponse<CandidateDto>> updateCandidate(
            @PathVariable Long candidateId,
            @Valid @RequestBody CandidateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        CandidateDto candidate = electionService.updateCandidate(candidateId, request, adminEmail);
        return ResponseEntity.ok(ApiResponse.success("Candidate updated successfully", candidate));
    }

    @DeleteMapping("/candidates/{candidateId}")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(
            @PathVariable Long candidateId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String adminEmail = userDetails.getUsername();
        electionService.deleteCandidate(candidateId, adminEmail);
        return ResponseEntity.ok(ApiResponse.success("Candidate removed successfully", null));
    }

    // Audit and Security Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditLogs() {
        List<AuditLogDto> logs = adminService.getAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/login-histories")
    public ResponseEntity<ApiResponse<List<LoginHistoryDto>>> getLoginHistories() {
        List<LoginHistoryDto> histories = adminService.getLoginHistories();
        return ResponseEntity.ok(ApiResponse.success(histories));
    }

    @GetMapping(value = "/export/audit-csv", produces = "text/csv")
    public ResponseEntity<String> exportAuditCsv() {
        String csv = adminService.exportAuditCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_logs_" + System.currentTimeMillis() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
