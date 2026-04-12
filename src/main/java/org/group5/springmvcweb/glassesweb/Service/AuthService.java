package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.AuthResponse;
import org.group5.springmvcweb.glassesweb.DTO.LoginRequest;
import org.group5.springmvcweb.glassesweb.DTO.RegisterRequest;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Entity.RefreshToken;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.group5.springmvcweb.glassesweb.security.JwtUtil;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository      accountRepository;
    private final CustomerRepository     customerRepository;
    private final PasswordEncoder        passwordEncoder;
    private final AuthenticationManager  authenticationManager;
    private final JwtUtil                jwtUtil;
    private final RefreshTokenService    refreshTokenService;   // ✅ MỚI

    // =============================================
    // Login — trả về access token + refresh token
    // =============================================
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String accessToken  = jwtUtil.generateToken(principal);
        RefreshToken refresh = refreshTokenService.createRefreshToken(principal.getAccountId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refresh.getToken())   // ✅ MỚI
                .tokenType("Bearer")
                .accountId(principal.getAccountId())
                .customerId(principal.getCustomerId())
                .username(principal.getUsername())
                .role(principal.getRole())
                .build();
    }

    // =============================================
    // Register — tạo tài khoản + trả về token ngay
    // =============================================
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
        }
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng: " + request.getEmail());
        }

        Customer customer = customerRepository.save(Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .status("ACTIVE")
                .build());

        Account account = accountRepository.save(Account.builder()
                .customer(customer)
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("CUSTOMER")
                .build());

        UserPrincipal principal = UserPrincipal.from(account);
        String accessToken   = jwtUtil.generateToken(principal);
        RefreshToken refresh  = refreshTokenService.createRefreshToken(account.getAccountId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refresh.getToken())   // ✅ MỚI
                .tokenType("Bearer")
                .accountId(account.getAccountId())
                .customerId(customer.getCustomerId())
                .username(account.getUsername())
                .role(account.getRole())
                .build();
    }

    // =============================================
    // Refresh — đổi refresh token lấy access token mới
    // =============================================
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenValue);
        Account account = refreshToken.getAccount();

        UserPrincipal principal = UserPrincipal.from(account);
        String newAccessToken = jwtUtil.generateToken(principal);

        // Rotate refresh token — bảo mật hơn, mỗi lần refresh token cũ bị thay
        RefreshToken newRefresh = refreshTokenService.createRefreshToken(account.getAccountId());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefresh.getToken())
                .tokenType("Bearer")
                .accountId(principal.getAccountId())
                .customerId(principal.getCustomerId())
                .username(principal.getUsername())
                .role(principal.getRole())
                .build();
    }

    // =============================================
    // Logout — revoke refresh token
    // =============================================
    public void logout(Integer accountId) {
        refreshTokenService.revokeAllByAccountId(accountId);
    }
}
