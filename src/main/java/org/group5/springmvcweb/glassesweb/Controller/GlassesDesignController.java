package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.GlassesDesignService;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GlassesDesignController
 *
 * POST   /api/glasses-designs              → Tạo bản thiết kế kính (CUSTOMER)
 * GET    /api/glasses-designs/me           → Xem danh sách design của mình (CUSTOMER)
 * GET    /api/glasses-designs/{id}         → Xem chi tiết 1 design (CUSTOMER)
 * DELETE /api/glasses-designs/{id}         → Xoá design DRAFT (CUSTOMER)
 *
 * GET    /api/my-glasses                   → Xem danh sách kính đã nhận (CUSTOMER)
 */
@RestController
@RequiredArgsConstructor
public class GlassesDesignController {

    private final GlassesDesignService glassesDesignService;

    // --------------------------------------------------
    // Tạo bản thiết kế kính mới
    // --------------------------------------------------
    @PostMapping("/api/glasses-designs")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<GlassesDesignResponse>> createDesign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody GlassesDesignRequest request) {

        GlassesDesignResponse response = glassesDesignService
                .createDesign(currentUser.getCustomerId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo thiết kế kính thành công", response));
    }

    // --------------------------------------------------
    // Xem danh sách design của mình
    // --------------------------------------------------
    @GetMapping("/api/glasses-designs/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<GlassesDesignResponse>>> getMyDesigns(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.ok(
                glassesDesignService.getMyDesigns(currentUser.getCustomerId())));
    }

    // --------------------------------------------------
    // Xem chi tiết 1 design
    // --------------------------------------------------
    @GetMapping("/api/glasses-designs/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<GlassesDesignResponse>> getDesignDetail(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {

        return ResponseEntity.ok(ApiResponse.ok(
                glassesDesignService.getDesignDetail(currentUser.getCustomerId(), id)));
    }

    // --------------------------------------------------
    // Xoá design (chỉ DRAFT)
    // --------------------------------------------------
    @DeleteMapping("/api/glasses-designs/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteDesign(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {

        glassesDesignService.deleteDesign(currentUser.getCustomerId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa thiết kế", null));
    }

    // --------------------------------------------------
    // Xem danh sách kính đã nhận (MyGlasses)
    // --------------------------------------------------
    @GetMapping("/api/my-glasses")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<MyGlassesResponse>>> getMyGlasses(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.ok(
                glassesDesignService.getMyGlasses(currentUser.getCustomerId())));
    }
}