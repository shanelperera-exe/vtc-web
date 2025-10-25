package com.vtcweb.backend.model.entity.user;

/**
 * Application roles. Prefix 'ROLE_' is conventional in Spring Security when using hasRole().
 */
public enum Role {
    ROLE_CUSTOMER,
    ROLE_ADMIN,
    ROLE_MANAGER; // Unique – only one account should have this at a time

    public static final String CUSTOMER = "ROLE_CUSTOMER";
    public static final String ADMIN = "ROLE_ADMIN";
    public static final String MANAGER = "ROLE_MANAGER";
}
