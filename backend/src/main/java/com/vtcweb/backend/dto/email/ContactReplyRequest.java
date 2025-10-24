package com.vtcweb.backend.dto.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ContactReplyRequest {
    @NotBlank @Email
    private String to;
    @NotBlank
    private String customerName;
    @NotBlank
    private String subject;
    @NotBlank
    private String message;

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
