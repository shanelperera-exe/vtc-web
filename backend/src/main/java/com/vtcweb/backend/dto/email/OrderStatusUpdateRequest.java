package com.vtcweb.backend.dto.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OrderStatusUpdateRequest {
    @NotBlank @Email
    private String to;
    @NotBlank
    private String orderId;
    @NotBlank
    private String status; // e.g., Shipped, Delivered
    @NotBlank
    private String customerName;

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
}
