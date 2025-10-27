package com.vtcweb.backend.exception;

/**
 * Thrown when a request conflicts with the current state of the resource
 * (e.g., unique constraint violations).
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
