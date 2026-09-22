package com.smartvote.exception;

import org.springframework.http.HttpStatus;

public class AccountLockedException extends AppException {
    public AccountLockedException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
