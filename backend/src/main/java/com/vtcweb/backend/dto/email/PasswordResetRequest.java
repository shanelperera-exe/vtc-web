package com.vtcweb.backend.dto.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetRequest {
    @NotBlank @Email
    private String to;
    @NotBlank
    private String resetLink;
    @NotBlank
    private String customerName;

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getResetLink() { return resetLink; }
    public void setResetLink(String resetLink) { this.resetLink = resetLink; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
}
