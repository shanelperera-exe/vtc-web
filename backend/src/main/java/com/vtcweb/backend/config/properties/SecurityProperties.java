package com.vtcweb.backend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "security")
public class SecurityProperties {
    private final Jwt jwt;
    private final Cookie cookie;

    public SecurityProperties(@DefaultValue Jwt jwt, @DefaultValue Cookie cookie) {
        this.jwt = jwt;
        this.cookie = cookie;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Cookie getCookie() {
        return cookie;
    }

    public static class Jwt {
        private final long accessTtlSeconds;
        private final long refreshTtlSeconds;
        private final long adminAccessTtlSeconds;
        private final long adminRefreshTtlSeconds;

        public Jwt(@DefaultValue("900") long accessTtlSeconds,
                @DefaultValue("604800") long refreshTtlSeconds,
                @DefaultValue("1800") long adminAccessTtlSeconds,
                @DefaultValue("86400") long adminRefreshTtlSeconds) {
            this.accessTtlSeconds = accessTtlSeconds;
            this.refreshTtlSeconds = refreshTtlSeconds;
            this.adminAccessTtlSeconds = adminAccessTtlSeconds;
            this.adminRefreshTtlSeconds = adminRefreshTtlSeconds;
        }

        public long getAccessTtlSeconds() {
            return accessTtlSeconds;
        }

        public long getRefreshTtlSeconds() {
            return refreshTtlSeconds;
        }

        public long getAdminAccessTtlSeconds() {
            return adminAccessTtlSeconds;
        }

        public long getAdminRefreshTtlSeconds() {
            return adminRefreshTtlSeconds;
        }
    }

    public static class Cookie {
        private final Refresh refresh;

        public Cookie(@DefaultValue Refresh refresh) {
            this.refresh = refresh;
        }

        public Refresh getRefresh() {
            return refresh;
        }
    }

    public static class Refresh {
        private final boolean secure;
        private final String sameSite;

        public Refresh(@DefaultValue("false") boolean secure,
                @DefaultValue("Lax") String sameSite) {
            this.secure = secure;
            this.sameSite = sameSite;
        }

        public boolean isSecure() {
            return secure;
        }

        public String getSameSite() {
            return sameSite;
        }
    }
}
