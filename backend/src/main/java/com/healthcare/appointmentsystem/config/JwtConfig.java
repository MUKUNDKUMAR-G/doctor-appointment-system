package com.healthcare.appointmentsystem.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    
    private String secret = "mySecretKeyForHealthcareAppointmentSystemThatShouldBeAtLeast256BitsLong";
    private long expiration = 900000; // 15 minutes in milliseconds
    private long refreshExpiration = 604800000; // 7 days in milliseconds

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }

    public long getRefreshExpiration() {
        return refreshExpiration;
    }

    public void setRefreshExpiration(long refreshExpiration) {
        this.refreshExpiration = refreshExpiration;
    }
}