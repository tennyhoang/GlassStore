package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.AuthResponse;
import org.group5.springmvcweb.glassesweb.DTO.LoginRequest;
import org.group5.springmvcweb.glassesweb.DTO.RegisterRequest;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
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

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    // =============================================
    // Đăng nhập — trả về JWT token
    // =============================================
    public AuthResponse login(LoginRequest request) {
        // Spring Security tự kiểm tra username + password
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = jwtUtil.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .accountId(principal.getAccountId())
                .customerId(principal.getCustomerId())
                .username(principal.getUsername())
                .role(principal.getRole())
                .build();
    }

    // =============================================
    // Đăng ký tài khoản CUSTOMER mới
    // =============================================
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra trùng username
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại: " + request.getUsername());
        }

        // Kiểm tra trùng email
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng: " + request.getEmail());
        }

        // Tạo Customer
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .status("ACTIVE")
                .build();
        customer = customerRepository.save(customer);

        // Tạo Account liên kết với Customer
        Account account = Account.builder()
                .customer(customer)
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("CUSTOMER")
                .build();
        account = accountRepository.save(account);

        // Tạo token và trả về
        UserPrincipal principal = UserPrincipal.from(account);
        String token = jwtUtil.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .accountId(account.getAccountId())
                .customerId(customer.getCustomerId())
                .username(account.getUsername())
                .role(account.getRole())
                .build();
    }
}