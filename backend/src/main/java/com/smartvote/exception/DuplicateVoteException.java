package com.smartvote.exception;

import org.springframework.http.HttpStatus;

public class DuplicateVoteException extends AppException {
    public DuplicateVoteException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
