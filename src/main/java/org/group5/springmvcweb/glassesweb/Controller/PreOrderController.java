package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pre-orders")
@RequiredArgsConstructor
public class PreOrderController {

    private final PreOrderRepository    preOrderRepository;
    private final CustomerRepository    customerRepository;
    private final FrameRepository       frameRepository;
    private final ReadyMadeGlassesRepository readyMadeRepository;

    // ── CUSTOMER: Tạo pre-order ──
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> create(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CreatePreOrderRequest req) {

        Customer customer = customerRepository.findById(user.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        PreOrder po = new PreOrder();
        po.setCustomer(customer);
        po.setQuantity(req.getQuantity() != null ? req.getQuantity() : 1);
        po.setShippingAddress(req.getShippingAddress());
        po.setNote(req.getNote());
        po.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (req.getFrameId() != null) {
            Frame frame = frameRepository.findById(req.getFrameId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            po.setFrame(frame);
            totalAmount = frame.getPrice().multiply(BigDecimal.valueOf(po.getQuantity()));
        } else if (req.getProductId() != null) {
            ReadyMadeGlasses product = readyMadeRepository.findById(req.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            po.setReadyMadeGlasses(product);
            totalAmount = product.getPrice().multiply(BigDecimal.valueOf(po.getQuantity()));
        }

        po.setTotalAmount(totalAmount);
        // Đặt cọc 30%
        po.setDepositAmount(totalAmount.multiply(new BigDecimal("0.3"))
                .setScale(0, RoundingMode.CEILING));

        preOrderRepository.save(po);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt trước thành công!", toResponse(po)));
    }

    // ── CUSTOMER: Xem pre-order của mình ──
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PreOrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal user) {
        List<PreOrderResponse> list = preOrderRepository
                .findByCustomer_CustomerIdOrderByCreatedAtDesc(user.getCustomerId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // ── STAFF: Xem tất cả ──
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','OPERATION')")
    public ResponseEntity<ApiResponse<List<PreOrderResponse>>> getAll(
            @RequestParam(required = false) String status) {
        List<PreOrder> list = status != null
                ? preOrderRepository.findByStatusOrderByCreatedAtDesc(status)
                : preOrderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.ok(
                list.stream().map(this::toResponse).collect(Collectors.toList())));
    }

    // ── STAFF: Xác nhận ──
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> confirm(
            @PathVariable Integer id,
            @RequestBody(required = false) StaffNoteRequest req) {
        return updateStatus(id, "CONFIRMED", req != null ? req.getNote() : null,
                req != null ? req.getExpectedDate() : null);
    }

    // ── OPERATIONS: Nhận hàng về kho ──
    @PatchMapping("/{id}/stock-received")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','OPERATION')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> stockReceived(
            @PathVariable Integer id,
            @RequestBody(required = false) StaffNoteRequest req) {
        return updateStatus(id, "STOCK_RECEIVED", req != null ? req.getNote() : null, null);
    }

    // ── OPERATIONS: Đang xử lý (đóng gói) ──
    @PatchMapping("/{id}/processing")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','OPERATION')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> processing(@PathVariable Integer id) {
        return updateStatus(id, "PROCESSING", null, null);
    }

    // ── OPERATIONS: Sẵn sàng giao ──
    @PatchMapping("/{id}/ready")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','OPERATION')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> ready(@PathVariable Integer id) {
        return updateStatus(id, "READY", null, null);
    }

    // ── OPERATIONS: Đã giao ──
    @PatchMapping("/{id}/delivered")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','OPERATION')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> delivered(@PathVariable Integer id) {
        return updateStatus(id, "DELIVERED", null, null);
    }

    // ── STAFF: Huỷ ──
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','CUSTOMER')")
    public ResponseEntity<ApiResponse<PreOrderResponse>> cancel(
            @PathVariable Integer id,
            @RequestBody(required = false) StaffNoteRequest req) {
        return updateStatus(id, "CANCELLED", req != null ? req.getNote() : null, null);
    }

    private ResponseEntity<ApiResponse<PreOrderResponse>> updateStatus(
            Integer id, String status, String note, LocalDateTime expectedDate) {
        PreOrder po = preOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy pre-order"));
        po.setStatus(status);
        if (note != null) po.setStaffNote(note);
        if (expectedDate != null) po.setExpectedDate(expectedDate);
        preOrderRepository.save(po);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật", toResponse(po)));
    }

    private PreOrderResponse toResponse(PreOrder po) {
        String productName = null;
        Integer productId  = null;
        String  productType = null;
        if (po.getFrame() != null) {
            productName = po.getFrame().getName();
            productId   = po.getFrame().getFrameId();
            productType = "FRAME";
        } else if (po.getReadyMadeGlasses() != null) {
            productName = po.getReadyMadeGlasses().getName();
            productId   = po.getReadyMadeGlasses().getProductId();
            productType = "READY_MADE";
        }
        return new PreOrderResponse(
                po.getPreOrderId(), po.getCustomer().getName(),
                productName, productId, productType,
                po.getQuantity(), po.getTotalAmount(), po.getDepositAmount(),
                po.getStatus(), po.getShippingAddress(), po.getNote(),
                po.getStaffNote(), po.getExpectedDate(), po.getCreatedAt()
        );
    }

    // ── DTOs ──
    @Getter @Setter @NoArgsConstructor
    public static class CreatePreOrderRequest {
        private Integer frameId;
        private Integer productId;
        private Integer quantity;
        private String  shippingAddress;
        private String  note;
    }

    @Getter @Setter @NoArgsConstructor
    public static class StaffNoteRequest {
        private String        note;
        private LocalDateTime expectedDate;
    }

    @Getter @AllArgsConstructor
    public static class PreOrderResponse {
        private Integer       preOrderId;
        private String        customerName;
        private String        productName;
        private Integer       productId;
        private String        productType;
        private Integer       quantity;
        private BigDecimal    totalAmount;
        private BigDecimal    depositAmount;
        private String        status;
        private String        shippingAddress;
        private String        note;
        private String        staffNote;
        private LocalDateTime expectedDate;
        private LocalDateTime createdAt;
    }
}