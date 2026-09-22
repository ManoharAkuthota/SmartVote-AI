package com.smartvote.dto;

import com.smartvote.entity.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public class VoterStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private UserStatus status;

    private String reason;

    public VoterStatusUpdateRequest() {
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
