package com.vtcweb.backend.controller;

import com.vtcweb.backend.dto.email.*;
import com.vtcweb.backend.service.email.EmailService;
import com.vtcweb.backend.service.email.EmailTemplateKey;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {
    private final EmailService emailService;

    public EmailController(EmailService emailService) { this.emailService = emailService; }

    @PostMapping("/test")
    public ResponseEntity<?> sendTest(@Valid @RequestBody EmailRequest req) {
        if (req.isHtml()) emailService.sendHtmlAsync(req.getTo(), req.getSubject(), req.getBody());
        else emailService.sendPlainTextAsync(req.getTo(), req.getSubject(), req.getBody());
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

    @PostMapping("/account-welcome")
    public ResponseEntity<?> accountWelcome(@Valid @RequestBody SimpleWelcomeRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("customer_name", req.getCustomerName());
        emailService.sendTemplateAsync(EmailTemplateKey.ACCOUNT_WELCOME, req.getTo(), "Welcome to VTC", params);
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

    @PostMapping("/order-confirmation")
    public ResponseEntity<?> orderConfirmation(@Valid @RequestBody OrderConfirmationRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("customer_name", req.getCustomerName());
        params.put("order_id", req.getOrderId());
        params.put("total", req.getTotal());
        params.put("items", req.getItems());
        emailService.sendTemplateAsync(EmailTemplateKey.ORDER_CONFIRMATION, req.getTo(), "Your VTC Order " + req.getOrderId(), params);
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<?> passwordReset(@Valid @RequestBody PasswordResetRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("customer_name", req.getCustomerName());
        params.put("reset_link", req.getResetLink());
        emailService.sendTemplateAsync(EmailTemplateKey.PASSWORD_RESET, req.getTo(), "Reset your VTC password", params);
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

    @PostMapping("/contact-reply")
    public ResponseEntity<?> contactReply(@Valid @RequestBody ContactReplyRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("customer_name", req.getCustomerName());
        params.put("subject", req.getSubject());
        params.put("message", req.getMessage());
        emailService.sendTemplateAsync(EmailTemplateKey.CONTACT_REPLY, req.getTo(), "Thanks for contacting VTC", params);
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

    @PostMapping("/newsletter-welcome")
    public ResponseEntity<?> newsletterWelcome(@Valid @RequestBody NewsletterWelcomeRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("customer_name", req.getCustomerName());
        emailService.sendTemplateAsync(EmailTemplateKey.NEWSLETTER_WELCOME, req.getTo(), "Welcome to VTC Newsletter", params);
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

    @PostMapping("/order-status")
    public ResponseEntity<?> orderStatus(@Valid @RequestBody OrderStatusUpdateRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("customer_name", req.getCustomerName());
        params.put("order_id", req.getOrderId());
        params.put("status", req.getStatus());
        emailService.sendTemplateAsync(EmailTemplateKey.ORDER_STATUS_UPDATE, req.getTo(), "Your order status updated", params);
        return ResponseEntity.accepted().body(Map.of("status", "queued"));
    }

}
