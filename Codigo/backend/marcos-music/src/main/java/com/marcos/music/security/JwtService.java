package com.marcos.music.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.marcos.music.entity.Usuario;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET;

    public String generateToken(Usuario user) {
        return generateToken(user, false);
    }

    public String generateToken(Usuario user, boolean rememberMe) {
        long expiryMs = rememberMe
                ? 30L * 24 * 60 * 60 * 1000   // 30 days
                : 8L * 60 * 60 * 1000;          // 8 hours

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("id", user.getId())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return UUID.fromString(claims.get("id").toString());
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /** true se o token foi emitido com "manter conectado" (validade longa). */
    public boolean isLongLived(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            long lifetimeMs = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
            return lifetimeMs > 24L * 60 * 60 * 1000;
        } catch (Exception e) {
            return false;
        }
    }
}