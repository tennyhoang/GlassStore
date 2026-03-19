package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;

// ─────────────────────────────────────────
// Response: Trả về sau login / register
// ─────────────────────────────────────────
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;           // JWT token
    private String tokenType;       // "Bearer"
    private Integer accountId;
    private Integer customerId;     // null nếu không phải CUSTOMER
    private String username;
    private String role;
}