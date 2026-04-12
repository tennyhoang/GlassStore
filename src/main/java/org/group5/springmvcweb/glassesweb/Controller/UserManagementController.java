package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final AccountRepository  accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder    passwordEncoder;

    // ── Danh sách tài khoản ──
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll(
            @RequestParam(required = false) String role) {
        List<Account> accounts = role != null
                ? accountRepository.findAll().stream()
                .filter(a -> role.equals(a.getRole()))
                .collect(Collectors.toList())
                : accountRepository.findAll();

        List<UserResponse> list = accounts.stream()
                .map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // ── Tạo tài khoản nhân sự ──
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(
            @RequestBody CreateUserRequest req) {

        if (accountRepository.existsByUsername(req.getUsername()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Tên đăng nhập đã tồn tại"));

        // Account role là String
        Account account = new Account();
        account.setUsername(req.getUsername());
        account.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        account.setRole(req.getRole());     // String trực tiếp
        account.setCreatedAt(LocalDateTime.now());
        account = accountRepository.save(account);

        // Nếu là CUSTOMER thì tạo Customer record
        if ("CUSTOMER".equals(req.getRole()) && req.getName() != null) {
            Customer customer = new Customer();
            customer.setName(req.getName());
            customer.setEmail(req.getEmail());
            customer.setPhone(req.getPhone());
            customer.setStatus("ACTIVE");
            customerRepository.save(customer);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo tài khoản thành công", toResponse(account)));
    }

    // ── Đổi role ──
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(
            @PathVariable Integer id,
            @RequestBody RoleRequest req) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        List<String> validRoles = List.of("CUSTOMER","STAFF","OPERATION","SHIPPER","ADMIN");
        if (!validRoles.contains(req.getRole()))
            return ResponseEntity.badRequest().body(ApiResponse.fail("Role không hợp lệ"));

        account.setRole(req.getRole());
        accountRepository.save(account);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật role", toResponse(account)));
    }

    // ── Reset mật khẩu ──
    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Integer id,
            @RequestBody ResetPasswordRequest req) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        String newPass = (req.getNewPassword() != null && !req.getNewPassword().isBlank())
                ? req.getNewPassword() : "123456";

        account.setPasswordHash(passwordEncoder.encode(newPass));
        accountRepository.save(account);
        return ResponseEntity.ok(ApiResponse.ok("Đã reset mật khẩu về: " + newPass, null));
    }

    // ── Xoá tài khoản ──
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        if (!accountRepository.existsById(id))
            return ResponseEntity.notFound().build();
        accountRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá tài khoản", null));
    }

    // ── Helper ──
    private UserResponse toResponse(Account a) {
        // Customer lookup từ bảng Customer (Customer không có FK account trong entity gốc)
        String customerName = null;
        if ("CUSTOMER".equals(a.getRole()) && a.getCustomer() != null) {
            customerName = a.getCustomer().getName();
        }
        return new UserResponse(
                a.getAccountId(),
                a.getUsername(),
                a.getRole(),        // String
                customerName,
                a.getCreatedAt()
        );
    }

    // ── DTOs ──
    @Getter @Setter @NoArgsConstructor
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String role;
        private String name, email, phone;
    }

    @Getter @Setter @NoArgsConstructor
    public static class RoleRequest {
        private String role;
    }

    @Getter @Setter @NoArgsConstructor
    public static class ResetPasswordRequest {
        private String newPassword;
    }

    @Getter @AllArgsConstructor
    public static class UserResponse {
        private Integer       accountId;
        private String        username;
        private String        role;
        private String        customerName;
        private LocalDateTime createdAt;
    }
}