package com.vtcweb.backend.service.email;

import com.vtcweb.backend.config.EmailProperties;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Local template-based email service using Thymeleaf templates under
 * classpath:templates/email/*.
 * Marked as @Primary to prefer local templates over Brevo API when both are
 * present.
 */
@Service
@Primary
public class LocalTemplateEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(LocalTemplateEmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailProperties emailProperties;

    public LocalTemplateEmailService(JavaMailSender mailSender, TemplateEngine templateEngine,
            EmailProperties emailProperties) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.emailProperties = emailProperties;
    }

    @Override
    public void sendPlainText(String to, String subject, String text) {
        validateAddress(to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setTo(java.util.Objects.requireNonNull(to, "to"));
            helper.setFrom(new InternetAddress(emailProperties.getFromAddress(), emailProperties.getFromName()));
            final String safeSubject = (subject != null) ? subject : "";
            final String safeText = (text != null) ? text : "";
            helper.setSubject(safeSubject);
            helper.setText(safeText, false);
            mailSender.send(message);
            log.info("[LocalTemplateEmailService] Sent plain text email to {} subject='{}'", to, subject);
        } catch (Exception e) {
            log.error("Plain text email send failed: {}", e.getMessage(), e);
            throw new RuntimeException("Email send failed", e);
        }
    }

    @Override
    public void sendHtml(String to, String subject, String html) {
        validateAddress(to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(java.util.Objects.requireNonNull(to, "to"));
            helper.setFrom(new InternetAddress(emailProperties.getFromAddress(), emailProperties.getFromName()));
            final String safeSubject = (subject != null) ? subject : "";
            final String safeHtml = (html != null) ? html : "";
            helper.setSubject(safeSubject);
            helper.setText(safeHtml, true);
            mailSender.send(message);
            log.info("[LocalTemplateEmailService] Sent HTML email to {} subject='{}'", to, subject);
        } catch (Exception e) {
            log.error("HTML email send failed: {}", e.getMessage(), e);
            throw new RuntimeException("Email send failed", e);
        }
    }

    @Override
    public void sendTemplate(EmailTemplateKey key, String to, String subject, Map<String, Object> params) {
        // Build Thymeleaf context
        Context context = new Context();
        if (params != null)
            params.forEach(context::setVariable);
        // Add common branding variables
        context.setVariable("brandName",
                StringUtils.hasText(emailProperties.getBrandName()) ? emailProperties.getBrandName()
                        : emailProperties.getFromName());
        context.setVariable("brandPrimaryColor",
                StringUtils.hasText(emailProperties.getBrandPrimaryColor()) ? emailProperties.getBrandPrimaryColor()
                        : "#0e7490");
        context.setVariable("logoUrl",
                StringUtils.hasText(emailProperties.getLogoUrl()) ? emailProperties.getLogoUrl() : "");
        context.setVariable("siteUrl",
                StringUtils.hasText(emailProperties.getSiteUrl()) ? emailProperties.getSiteUrl() : "");
        // Render and send
        try {
            String templateName = mapKeyToTemplate(key);
            String html = templateEngine.process("email/" + templateName, context);
            sendHtml(to, subject, html);
        } catch (Exception e) {
            log.error("Template render failed; attempting plain text fallback: {}", e.getMessage(), e);
            StringBuilder sb = new StringBuilder();
            sb.append(subject).append("\n\n");
            if (params != null) {
                params.forEach((k, v) -> sb.append(k).append(": ").append(String.valueOf(v)).append('\n'));
            }
            sendPlainText(to, subject, sb.toString());
        }
    }

    private String mapKeyToTemplate(EmailTemplateKey key) {
        return switch (key) {
            case ACCOUNT_WELCOME -> "account-welcome";
            case ORDER_CONFIRMATION -> "order-confirmation";
            case PASSWORD_RESET -> "password-reset";
            case PASSWORD_CHANGED -> "password-changed";
            case CONTACT_REPLY -> "contact-reply";
            case NEWSLETTER_WELCOME -> "newsletter-welcome";
            case ORDER_STATUS_UPDATE -> "order-status-update";
        };
    }

    private void validateAddress(String to) {
        if (!StringUtils.hasText(to) || to.contains("\n") || to.contains("\r")) {
            throw new IllegalArgumentException("Invalid recipient address");
        }
    }

    @Override
    @Async("emailExecutor")
    public void sendPlainTextAsync(String to, String subject, String text) {
        sendPlainText(to, subject, text);
    }

    @Override
    @Async("emailExecutor")
    public void sendHtmlAsync(String to, String subject, String html) {
        sendHtml(to, subject, html);
    }

    @Override
    @Async("emailExecutor")
    public void sendTemplateAsync(EmailTemplateKey key, String to, String subject, Map<String, Object> params) {
        sendTemplate(key, to, subject, params);
    }
}
