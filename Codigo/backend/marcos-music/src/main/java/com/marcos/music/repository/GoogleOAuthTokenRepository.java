package com.marcos.music.repository;

import com.marcos.music.entity.GoogleOAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GoogleOAuthTokenRepository extends JpaRepository<GoogleOAuthToken, UUID> {
}
