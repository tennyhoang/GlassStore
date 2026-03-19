package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

// ─────────────────────────────────────────
// Request: Đăng nhập
// ─────────────────────────────────────────
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    private String username;

    @NotBlank(message = "Password không được để trống")
    private String password;
}