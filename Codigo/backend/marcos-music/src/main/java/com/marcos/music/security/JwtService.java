package com.marcos.music.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import com.marcos.music.entity.Usuario;

import java.util.Date;

@Service
public class JwtService {

    private final String SECRET = "super-secret-key-super-secret-key";

    public String generateToken(Usuario user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .compact();
    }
}