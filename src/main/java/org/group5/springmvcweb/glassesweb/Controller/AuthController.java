package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.AuthService;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController
 *
 * POST /api/auth/register  → Đăng ký CUSTOMER
 * POST /api/auth/login     → Đăng nhập → access token + refresh token
 * POST /api/auth/refresh   → Dùng refresh token lấy access token mới   ✅ MỚI
 * POST /api/auth/logout    → Revoke refresh token                       ✅ MỚI
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký thành công", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Đăng nhập thành công", authService.login(request)));
    }

    /**
     * Làm mới access token.
     * Client gọi khi nhận 401 từ API — không cần user đăng nhập lại.
     *
     * Request body: { "refreshToken": "uuid-string" }
     * Response:     AuthResponse với access token mới + refresh token mới (rotation)
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Làm mới token thành công",
                        authService.refresh(request.getRefreshToken())));
    }

    /**
     * Đăng xuất — revoke refresh token.
     * Access token vẫn valid cho đến khi hết hạn (15 phút) nhưng
     * không thể refresh → buộc đăng nhập lại sau 15 phút.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        authService.logout(currentUser.getAccountId());
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất thành công", null));
    }
}
