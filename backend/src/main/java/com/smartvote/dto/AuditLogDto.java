package com.smartvote.dto;

import com.smartvote.entity.AuditLog;
import java.time.LocalDateTime;

public class AuditLogDto {

    private Long id;
    private String actorEmail;
    private String actorRole;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;

    public AuditLogDto() {
    }

    public static AuditLogDto fromEntity(AuditLog a) {
        if (a == null) return null;
        AuditLogDto dto = new AuditLogDto();
        dto.setId(a.getId());
        dto.setActorEmail(a.getActorEmail());
        dto.setActorRole(a.getActorRole());
        dto.setAction(a.getAction());
        dto.setEntityType(a.getEntityType());
        dto.setEntityId(a.getEntityId());
        dto.setDetails(a.getDetails());
        dto.setIpAddress(a.getIpAddress());
        dto.setTimestamp(a.getTimestamp());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(String actorEmail) {
        this.actorEmail = actorEmail;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
