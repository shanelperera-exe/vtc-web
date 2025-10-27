package com.vtcweb.backend.service.email;

import com.vtcweb.backend.config.BrevoApiProperties;
import com.vtcweb.backend.config.EmailProperties;
import com.vtcweb.backend.config.EmailTemplateIdsProperties;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class BrevoEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(BrevoEmailService.class);

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;
    private final BrevoApiProperties brevoApiProperties;
    private final EmailTemplateIdsProperties templateIds;

    private final RestTemplate restTemplate = new RestTemplate();

    public BrevoEmailService(JavaMailSender mailSender,
            EmailProperties emailProperties,
            BrevoApiProperties brevoApiProperties,
            EmailTemplateIdsProperties templateIds) {
        this.mailSender = mailSender;
        this.emailProperties = emailProperties;
        this.brevoApiProperties = brevoApiProperties;
        this.templateIds = templateIds;
    }

    @PostConstruct
    void init() {
        if (!StringUtils.hasText(emailProperties.getFromAddress())) {
            log.warn("app.email.from-address is not set; emails may fail SPF/DMARC checks");
        }
    }

    @Override
    public void sendPlainText(String to, String subject, String text) {
        validateAddress(to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setTo(to);
            helper.setFrom(new InternetAddress(emailProperties.getFromAddress(), emailProperties.getFromName()));
            helper.setSubject(subject);
            helper.setText(text, false);
            mailSender.send(message);
            log.info("Sent plain text email to {} subject='{}'", to, subject);
        } catch (Exception e) {
            log.error("Failed to send plain text email: {}", e.getMessage(), e);
            throw new RuntimeException("Email send failed", e);
        }
    }

    @Override
    public void sendHtml(String to, String subject, String html) {
        validateAddress(to);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(to);
            helper.setFrom(new InternetAddress(emailProperties.getFromAddress(), emailProperties.getFromName()));
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Sent HTML email to {} subject='{}'", to, subject);
        } catch (Exception e) {
            log.error("Failed to send HTML email: {}", e.getMessage(), e);
            throw new RuntimeException("Email send failed", e);
        }
    }

    @Override
    public void sendTemplate(EmailTemplateKey key, String to, String subject, Map<String, Object> params) {
        if (emailProperties.isUseBrevoApi() && StringUtils.hasText(brevoApiProperties.getKey())) {
            try {
                sendViaBrevoTemplate(key, to, subject, params);
                return;
            } catch (Exception apiEx) {
                log.error("Brevo API template send failed; {}", apiEx.getMessage(), apiEx);
                if (!emailProperties.isFallbackToSmtp()) {
                    throw new RuntimeException("Brevo API send failed", apiEx);
                }
            }
        }
        // fallback: send simple HTML rendering of parameters
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family:sans-serif'>");
        sb.append("<h2>").append(subject).append("</h2>");
        sb.append("<ul>");
        if (params != null) {
            params.forEach((k, v) -> sb.append("<li><b>").append(k).append(":</b> ").append(String.valueOf(v))
                    .append("</li>"));
        }
        sb.append("</ul></div>");
        sendHtml(to, subject, sb.toString());
    }

    private void sendViaBrevoTemplate(EmailTemplateKey key, String to, String subject, Map<String, Object> params) {
        long templateId = resolveTemplateId(key);
        String url = brevoApiProperties.getBaseUrl() + "/smtp/email";

        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> toRecipient = new HashMap<>();
        toRecipient.put("email", to);
        payload.put("to", new Object[] { toRecipient });

        Map<String, Object> sender = new HashMap<>();
        sender.put("email", emailProperties.getFromAddress());
        sender.put("name", emailProperties.getFromName());
        payload.put("sender", sender);
        payload.put("templateId", templateId);
        if (StringUtils.hasText(subject))
            payload.put("subject", subject);
        if (params != null)
            payload.put("params", params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("api-key", brevoApiProperties.getKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Brevo API non-2xx: " + response.getStatusCode());
        }
        log.info("Brevo API template {} sent to {}", templateId, to);
    }

    private long resolveTemplateId(EmailTemplateKey key) {
        return switch (key) {
            case ACCOUNT_WELCOME -> templateIds.getAccountWelcomeId();
            case ORDER_CONFIRMATION -> templateIds.getOrderConfirmationId();
            case PASSWORD_RESET -> templateIds.getPasswordResetId();
            case PASSWORD_CHANGED -> templateIds.getPasswordChangedId();
            case CONTACT_REPLY -> templateIds.getContactReplyId();
            case NEWSLETTER_WELCOME -> templateIds.getNewsletterWelcomeId();
            case ORDER_STATUS_UPDATE -> templateIds.getOrderStatusUpdateId();
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
