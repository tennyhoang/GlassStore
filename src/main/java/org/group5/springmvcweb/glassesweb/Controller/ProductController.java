package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Repository.FrameRepository;
import org.group5.springmvcweb.glassesweb.Service.ProductService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ProductController
 *
 * -- FRAME (/api/frames) --
 * GET    /api/frames              -> Tat ca (PUBLIC, cache)
 * GET    /api/frames/paged        -> Phan trang + filter nang cao (PUBLIC)
 * GET    /api/frames/metadata     -> Distinct brands/shapes/materials/colors (PUBLIC)
 * GET    /api/frames/{id}         -> Chi tiet (PUBLIC, cache)
 * POST   /api/frames              -> Tao moi (ADMIN/STAFF)
 * PUT    /api/frames/{id}         -> Cap nhat (ADMIN/STAFF)
 * DELETE /api/frames/{id}         -> Soft delete (ADMIN/STAFF)
 *
 * -- LENS (/api/lenses) --
 * GET    /api/lenses              -> Tat ca (PUBLIC, cache)
 * GET    /api/lenses/{id}         -> Chi tiet (PUBLIC)
 * POST   /api/lenses              -> Tao (ADMIN/STAFF)
 * PUT    /api/lenses/{id}         -> Cap nhat (ADMIN/STAFF)
 * DELETE /api/lenses/{id}         -> Soft delete (ADMIN/STAFF)
 * POST   /api/lenses/{id}/options -> Them option (ADMIN/STAFF)
 * DELETE /api/lenses/options/{id} -> Xoa option (ADMIN/STAFF)
 *
 * -- READY MADE (/api/ready-made-glasses) --
 * GET    /api/ready-made-glasses      -> Tat ca (PUBLIC, cache)
 * GET    /api/ready-made-glasses/{id} -> Chi tiet (PUBLIC)
 * POST   /api/ready-made-glasses      -> Tao (ADMIN/STAFF)
 * PUT    /api/ready-made-glasses/{id} -> Cap nhat (ADMIN/STAFF)
 * DELETE /api/ready-made-glasses/{id} -> Soft delete (ADMIN/STAFF)
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService  productService;
    private final FrameRepository frameRepository;   // dung cho /metadata

    // ══════════════════════════════════════════
    // FRAME
    // ══════════════════════════════════════════

    /** Tra ve tat ca frames — dung cho DesignPage (chon gong) */
    @GetMapping("/api/frames")
    public ResponseEntity<ApiResponse<List<FrameResponse>>> getAllFrames() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllFrames()));
    }

    /**
     * Frames co phan trang + filter nang cao — dung cho ShopPage.
     *
     * Params (tat ca optional):
     *   page     = 0           (default)
     *   size     = 12          (default)
     *   sort     = price,asc   (optional)
     *   q        = rayban      tim theo ten/brand
     *   brand    = Ray-Ban
     *   material = Titanium
     *   color    = Den
     *   shape    = Oval
     *   minPrice = 500000
     *   maxPrice = 3000000
     *
     * Vi du:
     *   GET /api/frames/paged?shape=Oval&brand=Ray-Ban&sort=price,asc
     *   GET /api/frames/paged?q=titan&minPrice=1000000
     */
    @GetMapping("/api/frames/paged")
    public ResponseEntity<ApiResponse<PageResponse<FrameResponse>>> getFramesPaged(
            @PageableDefault(size = 12, sort = "frameId", direction = Sort.Direction.DESC)
            Pageable pageable,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String shape,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        boolean hasFilter = (q != null && !q.isBlank())
                || brand != null || material != null || color != null
                || shape != null || minPrice != null || maxPrice != null;

        PageResponse<FrameResponse> result;
        if (hasFilter) {
            // Goi filterFrames voi day du param — null = bo qua dieu kien do
            result = productService.filterFrames(
                    (q != null && !q.isBlank()) ? q.trim() : null,
                    brand, material, color, shape,
                    minPrice, maxPrice, pageable);
        } else {
            result = productService.getFramesPaged(pageable);
        }

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Lay cac gia tri distinct de hien thi trong bo loc ShopPage.
     *
     * Response:
     * {
     *   "brands":    ["Ray-Ban", "Oakley", ...],
     *   "shapes":    ["Oval", "Rectangle", ...],
     *   "materials": ["Titanium", "Acetate", ...],
     *   "colors":    ["Den", "Vang", ...]
     * }
     */
    @GetMapping("/api/frames/metadata")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFrameMetadata() {
        List<String> statuses = List.of("AVAILABLE", "OUT_OF_STOCK");
        Map<String, Object> meta = new HashMap<>();
        meta.put("brands",    frameRepository.findDistinctBrands(statuses));
        meta.put("shapes",    frameRepository.findDistinctShapes(statuses));
        meta.put("materials", frameRepository.findDistinctMaterials(statuses));
        meta.put("colors",    frameRepository.findDistinctColors(statuses));
        return ResponseEntity.ok(ApiResponse.ok(meta));
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
                .body(ApiResponse.ok("Them gong kinh thanh cong",
                        productService.createFrame(request)));
    }

    @PutMapping("/api/frames/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<FrameResponse>> updateFrame(
            @PathVariable Integer id,
            @Valid @RequestBody FrameRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat gong kinh thanh cong",
                productService.updateFrame(id, request)));
    }

    @DeleteMapping("/api/frames/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteFrame(@PathVariable Integer id) {
        productService.deleteFrame(id);
        return ResponseEntity.ok(ApiResponse.ok("Da an gong kinh", null));
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
                .body(ApiResponse.ok("Them trong kinh thanh cong",
                        productService.createLens(request)));
    }

    @PutMapping("/api/lenses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<LensResponse>> updateLens(
            @PathVariable Integer id,
            @Valid @RequestBody LensRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat trong kinh thanh cong",
                productService.updateLens(id, request)));
    }

    @DeleteMapping("/api/lenses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteLens(@PathVariable Integer id) {
        productService.deleteLens(id);
        return ResponseEntity.ok(ApiResponse.ok("Da an trong kinh", null));
    }

    @PostMapping("/api/lenses/{id}/options")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<LensOptionResponse>> addLensOption(
            @PathVariable Integer id,
            @Valid @RequestBody LensOptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Them tuy chon thanh cong",
                        productService.addLensOption(id, request)));
    }

    @DeleteMapping("/api/lenses/options/{optionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteLensOption(@PathVariable Integer optionId) {
        productService.deleteLensOption(optionId);
        return ResponseEntity.ok(ApiResponse.ok("Da xoa tuy chon", null));
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
                .body(ApiResponse.ok("Them kinh lam san thanh cong",
                        productService.createReadyMadeGlasses(request)));
    }

    @PutMapping("/api/ready-made-glasses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReadyMadeGlassesResponse>> updateReadyMade(
            @PathVariable Integer id,
            @Valid @RequestBody ReadyMadeGlassesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat kinh lam san thanh cong",
                productService.updateReadyMadeGlasses(id, request)));
    }

    @DeleteMapping("/api/ready-made-glasses/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteReadyMade(@PathVariable Integer id) {
        productService.deleteReadyMadeGlasses(id);
        return ResponseEntity.ok(ApiResponse.ok("Da an san pham", null));
    }
}