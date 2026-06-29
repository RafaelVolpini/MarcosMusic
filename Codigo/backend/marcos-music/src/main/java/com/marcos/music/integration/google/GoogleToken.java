package com.marcos.music.integration.google;

import java.time.Instant;

public record GoogleToken(String accessToken, String refreshToken, Instant expiresAt) {
    public boolean isExpired() {
        return expiresAt == null || Instant.now().isAfter(expiresAt.minusSeconds(30));
    }
}
