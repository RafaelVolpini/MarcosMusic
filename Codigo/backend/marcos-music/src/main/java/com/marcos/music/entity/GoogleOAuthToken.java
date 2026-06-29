package com.marcos.music.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "google_oauth_token")
public class GoogleOAuthToken {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "access_token", length = 2000, nullable = false)
    private String accessToken;

    @Column(name = "refresh_token", length = 2000)
    private String refreshToken;

    /** Unix epoch seconds when the access token expires. */
    @Column(name = "expires_at", nullable = false)
    private long expiresAt;

    public GoogleOAuthToken() {}

    public GoogleOAuthToken(UUID userId, String accessToken, String refreshToken, long expiresAt) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
}
