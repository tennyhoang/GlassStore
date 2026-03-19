package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.DTO.AuthResponse;
import org.group5.springmvcweb.glassesweb.DTO.LoginRequest;
import org.group5.springmvcweb.glassesweb.DTO.RegisterRequest;
import org.group5.springmvcweb.glassesweb.Service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController
 * POST /api/auth/register  → Đăng ký CUSTOMER
 * POST /api/auth/login     → Đăng nhập, nhận JWT token
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }
}