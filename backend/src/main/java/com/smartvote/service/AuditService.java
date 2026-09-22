package com.smartvote.service;

import com.smartvote.entity.AuditLog;
import com.smartvote.entity.LoginHistory;
import com.smartvote.entity.User;
import com.smartvote.entity.enums.LoginStatus;
import com.smartvote.repository.AuditLogRepository;
import com.smartvote.repository.LoginHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;
    private final LoginHistoryRepository loginHistoryRepository;

    public AuditService(AuditLogRepository auditLogRepository, LoginHistoryRepository loginHistoryRepository) {
        this.auditLogRepository = auditLogRepository;
        this.loginHistoryRepository = loginHistoryRepository;
    }

    @Async
    public void logAction(String actorEmail, String actorRole, String action,
                          String entityType, String entityId, String details, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(actorEmail, actorRole, action, entityType, entityId, details, ipAddress);
            auditLogRepository.save(auditLog);
            log.info("AUDIT: [{}] by {} ({}) on {} {}: {}", action, actorEmail, actorRole, entityType, entityId, details);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    @Async
    public void logLogin(String email, User user, String ipAddress, String userAgent,
                         String deviceFingerprint, LoginStatus status, String failureReason, String locationInfo) {
        try {
            LoginHistory history = new LoginHistory(email, user, ipAddress, userAgent,
                    deviceFingerprint, status, failureReason, locationInfo);
            loginHistoryRepository.save(history);
            log.info("LOGIN AUDIT: Email: {}, Status: {}, Reason: {}, IP: {}", email, status, failureReason, ipAddress);
        } catch (Exception e) {
            log.error("Failed to save login history: {}", e.getMessage());
        }
    }
}
