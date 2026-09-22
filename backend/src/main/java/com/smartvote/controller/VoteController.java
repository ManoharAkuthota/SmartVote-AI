package com.smartvote.controller;

import com.smartvote.dto.ApiResponse;
import com.smartvote.dto.CastVoteRequest;
import com.smartvote.dto.ReceiptVerifyResponse;
import com.smartvote.dto.VoteReceiptResponse;
import com.smartvote.service.VoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping("/cast")
    public ResponseEntity<ApiResponse<VoteReceiptResponse>> castVote(
            @Valid @RequestBody CastVoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest servletRequest) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required to vote"));
        }
        String ipAddress = extractIpAddress(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");

        VoteReceiptResponse receipt = voteService.castVote(request, userDetails.getUsername(), ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vote cryptographically sealed successfully", receipt));
    }

    @GetMapping("/my-votes")
    public ResponseEntity<ApiResponse<List<VoteReceiptResponse>>> getMyVotes(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        List<VoteReceiptResponse> history = voteService.getVoterHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/verify-receipt/{receiptId}")
    public ResponseEntity<ApiResponse<ReceiptVerifyResponse>> verifyReceipt(@PathVariable String receiptId) {
        ReceiptVerifyResponse response = voteService.verifyReceipt(receiptId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
