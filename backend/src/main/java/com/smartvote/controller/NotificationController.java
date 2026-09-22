package com.smartvote.controller;

import com.smartvote.dto.ApiResponse;
import com.smartvote.entity.Notification;
import com.smartvote.entity.User;
import com.smartvote.repository.UserRepository;
import com.smartvote.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
