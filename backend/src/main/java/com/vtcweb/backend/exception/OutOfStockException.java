package com.vtcweb.backend.exception;

public class OutOfStockException extends RuntimeException {
    private final Integer availableStock;

    public OutOfStockException(String message) {
        super(message);
        this.availableStock = null;
    }

    public OutOfStockException(String message, Throwable cause) {
        super(message, cause);
        this.availableStock = null;
    }

    public OutOfStockException(String message, Integer availableStock) {
        super(message);
        this.availableStock = availableStock;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }
}
