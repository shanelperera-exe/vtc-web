package com.vtcweb.backend.dto.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EmailRequest {
    @NotBlank
    @Email
    private String to;
    @NotBlank
    private String subject;
    @NotBlank
    private String body;
    private boolean html;

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public boolean isHtml() { return html; }
    public void setHtml(boolean html) { this.html = html; }
}
