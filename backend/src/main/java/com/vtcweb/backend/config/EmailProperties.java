package com.vtcweb.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {
    private String fromAddress;
    private String fromName;
    private String brandName;
    private String brandPrimaryColor;
    private String logoUrl;
    private String siteUrl;
    private boolean asyncEnabled = true;
    private boolean useBrevoApi = true;
    private boolean fallbackToSmtp = true;

    public String getFromAddress() { return fromAddress; }
    public void setFromAddress(String fromAddress) { this.fromAddress = fromAddress; }
    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getBrandPrimaryColor() { return brandPrimaryColor; }
    public void setBrandPrimaryColor(String brandPrimaryColor) { this.brandPrimaryColor = brandPrimaryColor; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getSiteUrl() { return siteUrl; }
    public void setSiteUrl(String siteUrl) { this.siteUrl = siteUrl; }
    public boolean isAsyncEnabled() { return asyncEnabled; }
    public void setAsyncEnabled(boolean asyncEnabled) { this.asyncEnabled = asyncEnabled; }
    public boolean isUseBrevoApi() { return useBrevoApi; }
    public void setUseBrevoApi(boolean useBrevoApi) { this.useBrevoApi = useBrevoApi; }
    public boolean isFallbackToSmtp() { return fallbackToSmtp; }
    public void setFallbackToSmtp(boolean fallbackToSmtp) { this.fallbackToSmtp = fallbackToSmtp; }
}
