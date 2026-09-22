package com.smartvote.controller;

import com.smartvote.dto.*;
import com.smartvote.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = extractIpAddress(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UserDto userDto = authService.register(request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Digital identity and facial security profile registered successfully", userDto));
    }

    @PostMapping("/login-init")
    public ResponseEntity<ApiResponse<LoginInitResponse>> loginInit(
            @Valid @RequestBody LoginInitialRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = extractIpAddress(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        LoginInitResponse response = authService.loginInit(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Initial credentials verified", response));
    }

    @PostMapping("/verify-face")
    public ResponseEntity<ApiResponse<LoginInitResponse>> verifyFace(
            @Valid @RequestBody FaceVerifyRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = extractIpAddress(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        LoginInitResponse response = authService.verifyFace(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Facial security and liveness verified. OTP sent to email.", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = extractIpAddress(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        JwtResponse response = authService.verifyOtp(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful. Welcome to SmartVote AI.", response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        String code = authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("New verification OTP dispatched to your registered email.", java.util.Map.of("demoOtp", code)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        UserDto userDto = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
