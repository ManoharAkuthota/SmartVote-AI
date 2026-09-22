package com.smartvote.exception;

import org.springframework.http.HttpStatus;

public class FaceMatchException extends AppException {
    public FaceMatchException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
