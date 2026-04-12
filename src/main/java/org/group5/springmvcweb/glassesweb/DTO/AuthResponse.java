package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;

/**
 * Response trả về sau login / register / refresh.
 * Thêm refreshToken so với version cũ.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {

    private String  token;           // JWT access token (15 phút)
    private String  refreshToken;    // Refresh token (7 ngày) — ✅ MỚI
    private String  tokenType;       // "Bearer"
    private Integer accountId;
    private Integer customerId;      // null nếu không phải CUSTOMER
    private String  username;
    private String  role;
}
