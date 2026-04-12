package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.Discount;
import org.group5.springmvcweb.glassesweb.Repository.DiscountRepository;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountRepository discountRepository;

    // ── Xem tất cả ──
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> getAll() {
        List<DiscountResponse> list = discountRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // ── Kiểm tra mã ──
    @GetMapping("/check/{code}")
    public ResponseEntity<ApiResponse<DiscountResponse>> checkCode(
            @PathVariable String code) {
        return discountRepository.findByCode(code)
                .map(d -> {
                    if (!"ACTIVE".equals(d.getStatus()))
                        return ResponseEntity.badRequest()
                                .<ApiResponse<DiscountResponse>>body(
                                        ApiResponse.fail("Mã giảm giá đã hết hiệu lực"));
                    if (d.getExpiresAt() != null && d.getExpiresAt().isBefore(LocalDateTime.now()))
                        return ResponseEntity.badRequest()
                                .<ApiResponse<DiscountResponse>>body(
                                        ApiResponse.fail("Mã giảm giá đã hết hạn"));
                    if (d.getUsageLimit() != null && d.getUsedCount() != null
                            && d.getUsedCount() >= d.getUsageLimit())
                        return ResponseEntity.badRequest()
                                .<ApiResponse<DiscountResponse>>body(
                                        ApiResponse.fail("Mã giảm giá đã hết lượt dùng"));
                    return ResponseEntity.ok(ApiResponse.ok("Mã hợp lệ", toResponse(d)));
                })
                .orElse(ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Mã giảm giá không tồn tại")));
    }

    // ── Tạo mới ──
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountResponse>> create(
            @RequestBody DiscountRequest req) {
        if (discountRepository.findByCode(req.getCode()).isPresent())
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Mã giảm giá đã tồn tại"));

        Discount d = new Discount();
        d.setCode(req.getCode().toUpperCase().trim());
        d.setDiscountType(req.getDiscountType());       // String: "PERCENTAGE"/"FIXED"
        d.setDiscountValue(req.getDiscountValue());
        d.setMinOrderValue(req.getMinOrderValue());     // đúng tên field
        d.setUsageLimit(req.getUsageLimit());
        d.setExpiresAt(req.getExpiresAt());             // đúng tên field
        d.setStatus("ACTIVE");
        d.setUsedCount(0);
        discountRepository.save(d);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo mã giảm giá thành công", toResponse(d)));
    }

    // ── Cập nhật ──
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountResponse>> update(
            @PathVariable Integer id,
            @RequestBody DiscountRequest req) {
        Discount d = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
        d.setCode(req.getCode().toUpperCase().trim());
        d.setDiscountType(req.getDiscountType());
        d.setDiscountValue(req.getDiscountValue());
        d.setMinOrderValue(req.getMinOrderValue());
        d.setUsageLimit(req.getUsageLimit());
        d.setExpiresAt(req.getExpiresAt());
        if (req.getActive() != null)
            d.setStatus(Boolean.TRUE.equals(req.getActive()) ? "ACTIVE" : "INACTIVE");
        discountRepository.save(d);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", toResponse(d)));
    }

    // ── Xoá ──
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        discountRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá mã giảm giá", null));
    }

    // ── Toggle ACTIVE / INACTIVE ──
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountResponse>> toggle(@PathVariable Integer id) {
        Discount d = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
        boolean nowActive = !"ACTIVE".equals(d.getStatus());
        d.setStatus(nowActive ? "ACTIVE" : "INACTIVE");
        discountRepository.save(d);
        return ResponseEntity.ok(ApiResponse.ok(
                nowActive ? "Đã bật mã giảm giá" : "Đã tắt mã giảm giá",
                toResponse(d)));
    }

    // ── toResponse ──
    private DiscountResponse toResponse(Discount d) {
        return new DiscountResponse(
                d.getDiscountId(),
                d.getCode(),
                d.getDiscountType(),                        // String
                d.getDiscountValue(),
                d.getMinOrderValue(),                       // đúng tên
                d.getUsageLimit(),
                d.getUsedCount(),
                d.getExpiresAt(),                           // đúng tên
                "ACTIVE".equals(d.getStatus())             // boolean từ String
        );
    }

    // ── DTOs ──
    @Getter @Setter @NoArgsConstructor
    public static class DiscountRequest {
        private String        code;
        private String        discountType;   // "PERCENTAGE" | "FIXED"
        private BigDecimal    discountValue;
        private BigDecimal    minOrderValue;  // tên FE gửi lên
        private Integer       usageLimit;
        private LocalDateTime expiresAt;     // tên FE gửi lên
        private Boolean       active;
    }

    @Getter @AllArgsConstructor
    public static class DiscountResponse {
        private Integer       discountId;
        private String        code;
        private String        discountType;
        private BigDecimal    discountValue;
        private BigDecimal    minOrderValue;
        private Integer       usageLimit;
        private Integer       usedCount;
        private LocalDateTime expiresAt;
        private boolean       active;
    }
}