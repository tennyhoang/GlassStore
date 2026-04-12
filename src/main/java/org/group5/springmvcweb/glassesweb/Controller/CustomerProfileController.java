package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerRepository customerRepository;
    private final AccountRepository  accountRepository;
    private final PasswordEncoder    passwordEncoder;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> getMe(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Customer c = customerRepository.findById(currentUser.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        return ResponseEntity.ok(ApiResponse.ok(toResponse(c)));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateMe(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody UpdateProfileRequest req) {
        Customer c = customerRepository.findById(currentUser.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        if (req.getName()    != null && !req.getName().isBlank())    c.setName(req.getName());
        if (req.getEmail()   != null && !req.getEmail().isBlank())   c.setEmail(req.getEmail());
        if (req.getPhone()   != null && !req.getPhone().isBlank())   c.setPhone(req.getPhone());
        if (req.getAddress() != null && !req.getAddress().isBlank()) c.setAddress(req.getAddress());
        customerRepository.save(c);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", toResponse(c)));
    }

    @PatchMapping("/me/password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody ChangePasswordRequest req) {

        // Tìm account theo accountId từ token
        Account account = accountRepository.findById(currentUser.getAccountId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), account.getPasswordHash()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Mật khẩu hiện tại không đúng"));

        if (req.getNewPassword() == null || req.getNewPassword().length() < 6)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Mật khẩu mới tối thiểu 6 ký tự"));

        account.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        accountRepository.save(account);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(
                c.getCustomerId(), c.getName(),
                c.getEmail(), c.getPhone(), c.getAddress());
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CustomerResponse {
        private Integer customerId;
        private String  name, email, phone, address;
    }

    @Getter @Setter @NoArgsConstructor
    public static class UpdateProfileRequest {
        private String name, email, phone, address;
    }

    @Getter @Setter @NoArgsConstructor
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }
}