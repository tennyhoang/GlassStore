package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.EyeProfileService;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/eye-profiles")
@RequiredArgsConstructor
public class EyeProfileController {

    private final EyeProfileService eyeProfileService;

    // ── Tạo hồ sơ nhập tay ──
    @PostMapping("/manual")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> createManual(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody EyeProfileManualRequest request) {

        EyeProfileResponse response = eyeProfileService.createManual(
                currentUser.getCustomerId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo hồ sơ mắt thành công", response));
    }

    // ── Upload file đơn thuốc ──
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> createByUpload(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("profileName") String profileName,
            @RequestParam("file") MultipartFile file) {

        if (profileName == null || profileName.isBlank())
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Vui lòng đặt tên cho hồ sơ mắt"));

        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Vui lòng chọn file để upload"));

        String ct = file.getContentType();
        if (ct == null || (!ct.equals("image/jpeg") && !ct.equals("image/png")
                && !ct.equals("application/pdf")))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Chỉ chấp nhận .jpg, .png hoặc .pdf"));

        EyeProfileResponse response = eyeProfileService.createByUpload(
                currentUser.getCustomerId(), profileName.trim(), file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Upload hồ sơ mắt thành công", response));
    }

    // ── Xem danh sách hồ sơ của mình ──
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<EyeProfileResponse>>> getMyProfiles(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.ok(
                eyeProfileService.getMyProfiles(currentUser.getCustomerId())));
    }

    // ── Xem chi tiết một hồ sơ ──
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> getProfileDetail(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {

        return ResponseEntity.ok(ApiResponse.ok(
                eyeProfileService.getProfileDetail(currentUser.getCustomerId(), id)));
    }

    // ── Vô hiệu hoá hồ sơ ──
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> deactivate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {

        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá hồ sơ mắt",
                eyeProfileService.deactivateProfile(currentUser.getCustomerId(), id)));
    }

    // ── STAFF/ADMIN: Xem hồ sơ của bất kỳ customer ──
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<List<EyeProfileResponse>>> getByCustomer(
            @PathVariable Integer customerId) {

        return ResponseEntity.ok(ApiResponse.ok(
                eyeProfileService.getProfilesByCustomerId(customerId)));
    }
}