package com.vtcweb.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.email.templates")
public class EmailTemplateIdsProperties {
    private long accountWelcomeId;
    private long orderConfirmationId;
    private long passwordResetId;
    private long passwordChangedId;
    private long contactReplyId;
    private long newsletterWelcomeId;
    private long orderStatusUpdateId;

    public long getAccountWelcomeId() {
        return accountWelcomeId;
    }

    public void setAccountWelcomeId(long accountWelcomeId) {
        this.accountWelcomeId = accountWelcomeId;
    }

    public long getOrderConfirmationId() {
        return orderConfirmationId;
    }

    public void setOrderConfirmationId(long orderConfirmationId) {
        this.orderConfirmationId = orderConfirmationId;
    }

    public long getPasswordResetId() {
        return passwordResetId;
    }

    public void setPasswordResetId(long passwordResetId) {
        this.passwordResetId = passwordResetId;
    }

    public long getPasswordChangedId() {
        return passwordChangedId;
    }

    public void setPasswordChangedId(long passwordChangedId) {
        this.passwordChangedId = passwordChangedId;
    }

    public long getContactReplyId() {
        return contactReplyId;
    }

    public void setContactReplyId(long contactReplyId) {
        this.contactReplyId = contactReplyId;
    }

    public long getNewsletterWelcomeId() {
        return newsletterWelcomeId;
    }

    public void setNewsletterWelcomeId(long newsletterWelcomeId) {
        this.newsletterWelcomeId = newsletterWelcomeId;
    }

    public long getOrderStatusUpdateId() {
        return orderStatusUpdateId;
    }

    public void setOrderStatusUpdateId(long orderStatusUpdateId) {
        this.orderStatusUpdateId = orderStatusUpdateId;
    }
}
