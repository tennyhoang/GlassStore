package org.group5.springmvcweb.glassesweb.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtUtil — tạo, parse, validate JWT token.
 *
 * Token payload chứa:
 *   - sub        : username
 *   - accountId  : Integer
 *   - customerId : Integer (null nếu không phải CUSTOMER)
 *   - role       : String (CUSTOMER / STAFF / ADMIN / OPERATION / SHIPPER)
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Tạo token từ UserPrincipal
    public String generateToken(UserPrincipal user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("accountId",  user.getAccountId())
                .claim("customerId", user.getCustomerId())
                .claim("role",       user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    // Parse toàn bộ claims từ token
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}