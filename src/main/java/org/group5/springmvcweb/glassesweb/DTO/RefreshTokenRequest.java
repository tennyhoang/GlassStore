package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

// ── Request: gửi refresh token để lấy access token mới ──────────────────────
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token không được để trống")
    private String refreshToken;
}
