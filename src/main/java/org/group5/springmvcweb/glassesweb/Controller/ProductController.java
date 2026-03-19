package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ProductController
 *
 * ── FRAME (/api/frames) ──────────────────────────────
 * GET    /api/frames              → Danh sách gọng (PUBLIC)
 * GET    /api/frames/{id}         → Chi tiết gọng (PUBLIC)
 * POST   /api/frames              → Thêm gọng (ADMIN/STAFF)
 * PUT    /api/frames/{id}         → Sửa gọng (ADMIN/STAFF)
 * DELETE /api/frames/{id}         → Ẩn gọng (ADMIN/STAFF)
 *
 * ── LENS (/api/lenses) ───────────────────────────────
 * GET    /api/lenses              → Danh sách tròng (PUBLIC)
 * GET    /api/lenses/{id}         → Chi tiết tròng (PUBLIC)
 * POST   /api/lenses              → Thêm tròng (ADMIN/STAFF)
 * PUT    /api/lenses/{id}         → Sửa tròng (ADMIN/STAFF)
 * DELETE /api/lenses/{id}         → Ẩn tròng (ADMIN/STAFF)
 * POST   /api/lenses/{id}/options → Thêm tùy chọn (ADMIN/STAFF)
 * DELETE /api/lenses/options/{optionId} → Xóa tùy chọn (ADMIN/STAFF)
 *
 * ── READY MADE GLASSES (/api/ready-made-glasses) ─────
 * GET    /api/ready-made-glasses        → Danh sách kính sẵn (PUBLIC)
 * GET    /api/ready-made-glasses/{id}   → Chi tiết (PUBLIC)
 * POST   /api/ready-made-glasses        → Thêm (ADMIN/STAFF)
 * PUT    /api/ready-made-glasses/{id}   → Sửa (ADMIN/STAFF)
 * DELETE /api/ready-made-glasses/{id}   → Ẩn (ADMIN/STAFF)
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ══════════════════════════════════════════
    // FRAME
    // ══════════════════════════════════════════

    @GetMapping("/api/frames")
    public ResponseEntity<ApiResponse<List<FrameResponse>>> getAllFrames() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllFrames()));
    }

    @GetMapping("/api/frames/{id}")
    public ResponseEntity<ApiResponse<FrameResponse>> getFrame(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFrameById(id)));
    }

    @PostMapping("/api/frames")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<FrameResponse>> createFrame(
            @Valid @RequestBody FrameRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm gọng kính thành công",
                        productService.createFrame(request)));
    }

    @PutMapping("/api/frames/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<FrameResponse>> updateFrame(
            @PathVariable Integer id,
            @Valid @RequestBody FrameRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật gọng kính thành công",
                productService.updateFrame(id, request)));
    }

    @DeleteMapping("/api/frames/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteFrame(@PathVariable Integer id) {
        productService.deleteFrame(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã ẩn gọng kính", null));
    }

    // ══════════════════════════════════════════
    // LENS
    // ══════════════════════════════════════════

    @GetMapping("/api/lenses")
    public ResponseEntity<ApiResponse<List<LensResponse>>> getAllLenses() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllLenses()));
    }

    @GetMapping("/api/lenses/{id}")
    public ResponseEntity<ApiResponse<LensResponse>> getLens(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getLensById(id)));
    }

    @PostMapping("/api/lenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<LensResponse>> createLens(
            @Valid @RequestBody LensRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm tròng kính thành công",
                        productService.createLens(request)));
    }

    @PutMapping("/api/lenses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<LensResponse>> updateLens(
            @PathVariable Integer id,
            @Valid @RequestBody LensRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tròng kính thành công",
                productService.updateLens(id, request)));
    }

    @DeleteMapping("/api/lenses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteLens(@PathVariable Integer id) {
        productService.deleteLens(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã ẩn tròng kính", null));
    }

    @PostMapping("/api/lenses/{id}/options")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<LensOptionResponse>> addLensOption(
            @PathVariable Integer id,
            @Valid @RequestBody LensOptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm tùy chọn thành công",
                        productService.addLensOption(id, request)));
    }

    @DeleteMapping("/api/lenses/options/{optionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteLensOption(@PathVariable Integer optionId) {
        productService.deleteLensOption(optionId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa tùy chọn", null));
    }

    // ══════════════════════════════════════════
    // READY MADE GLASSES
    // ══════════════════════════════════════════

    @GetMapping("/api/ready-made-glasses")
    public ResponseEntity<ApiResponse<List<ReadyMadeGlassesResponse>>> getAllReadyMade() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllReadyMadeGlasses()));
    }

    @GetMapping("/api/ready-made-glasses/{id}")
    public ResponseEntity<ApiResponse<ReadyMadeGlassesResponse>> getReadyMade(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.getReadyMadeGlassesById(id)));
    }

    @PostMapping("/api/ready-made-glasses")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReadyMadeGlassesResponse>> createReadyMade(
            @Valid @RequestBody ReadyMadeGlassesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm kính làm sẵn thành công",
                        productService.createReadyMadeGlasses(request)));
    }

    @PutMapping("/api/ready-made-glasses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReadyMadeGlassesResponse>> updateReadyMade(
            @PathVariable Integer id,
            @Valid @RequestBody ReadyMadeGlassesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                productService.updateReadyMadeGlasses(id, request)));
    }

    @DeleteMapping("/api/ready-made-glasses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteReadyMade(@PathVariable Integer id) {
        productService.deleteReadyMadeGlasses(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã ẩn sản phẩm", null));
    }
}