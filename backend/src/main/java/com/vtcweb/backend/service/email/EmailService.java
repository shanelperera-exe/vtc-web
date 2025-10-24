package com.vtcweb.backend.service.email;

import java.util.Map;

public interface EmailService {
    void sendPlainText(String to, String subject, String text);
    void sendHtml(String to, String subject, String html);
    void sendTemplate(EmailTemplateKey key, String to, String subject, Map<String, Object> params);

    // Async variants (will delegate to @Async methods)
    void sendPlainTextAsync(String to, String subject, String text);
    void sendHtmlAsync(String to, String subject, String html);
    void sendTemplateAsync(EmailTemplateKey key, String to, String subject, Map<String, Object> params);
}
