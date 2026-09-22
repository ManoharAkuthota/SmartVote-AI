package com.smartvote.controller;

import com.smartvote.dto.ApiResponse;
import com.smartvote.dto.ElectionDto;
import com.smartvote.service.ElectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elections")
public class ElectionController {

    private final ElectionService electionService;

    public ElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<ElectionDto>>> getPublicElections() {
        List<ElectionDto> elections = electionService.getAllElections(null);
        return ResponseEntity.ok(ApiResponse.success(elections));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ElectionDto>>> getAllElections(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        List<ElectionDto> elections = electionService.getAllElections(email);
        return ResponseEntity.ok(ApiResponse.success(elections));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ElectionDto>>> getActiveElections(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        List<ElectionDto> elections = electionService.getActiveElections(email);
        return ResponseEntity.ok(ApiResponse.success(elections));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<ElectionDto>>> getUpcomingElections() {
        List<ElectionDto> elections = electionService.getUpcomingElections();
        return ResponseEntity.ok(ApiResponse.success(elections));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ElectionDto>> getElectionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        ElectionDto election = electionService.getElectionById(id, email);
        return ResponseEntity.ok(ApiResponse.success(election));
    }
}
