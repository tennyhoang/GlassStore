package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.ManufacturingOrderService;
import org.group5.springmvcweb.glassesweb.Service.PaymentService;
import org.group5.springmvcweb.glassesweb.Service.ShipmentService;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ── PAYMENT (/api/payments) ──────────────────────────
 * POST   /api/payments/orders/{orderId}         → Thanh toán đơn (CUSTOMER, mock)
 * GET    /api/payments/orders/{orderId}         → Xem thanh toán (CUSTOMER/STAFF)
 *
 * ── MANUFACTURING (/api/manufacturing) ───────────────
 * POST   /api/manufacturing/orders/{orderId}    → Tạo lệnh sx khi confirm (STAFF)
 * GET    /api/manufacturing                     → Xem lệnh sx theo status (OPERATION/STAFF)
 * GET    /api/manufacturing/{id}                → Chi tiết lệnh (OPERATION/STAFF)
 * PATCH  /api/manufacturing/{id}/status        → Cập nhật tiến độ (OPERATION)
 *
 * ── SHIPMENT (/api/shipments) ────────────────────────
 * GET    /api/shipments                         → Xem tất cả theo status (STAFF/ADMIN)
 * GET    /api/shipments/me                      → Đơn giao của tôi (SHIPPER)
 * GET    /api/shipments/{id}                    → Chi tiết (STAFF/ADMIN/SHIPPER)
 * PATCH  /api/shipments/{id}/assign/{accountId} → Gán shipper (STAFF/ADMIN)
 * PATCH  /api/shipments/{id}/status             → Cập nhật giao hàng (SHIPPER)
 */
@RestController
@RequiredArgsConstructor
public class OperationController {

    private final PaymentService paymentService;
    private final ManufacturingOrderService manufacturingOrderService;
    private final ShipmentService shipmentService;

    // ══════════════════════════════════════════
    // PAYMENT
    // ══════════════════════════════════════════

    @PostMapping("/api/payments/orders/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> pay(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer orderId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thanh toán thành công",
                        paymentService.pay(currentUser.getCustomerId(),
                                orderId, request)));
    }

    @GetMapping("/api/payments/orders/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(ApiResponse.ok(
                paymentService.getPaymentByOrderId(orderId)));
    }

    // ══════════════════════════════════════════
    // MANUFACTURING ORDER
    // ══════════════════════════════════════════

    @PostMapping("/api/manufacturing/orders/{orderId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ManufacturingOrderResponse>> createManufacturing(
            @PathVariable Integer orderId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã tạo lệnh sản xuất",
                        manufacturingOrderService.createManufacturingOrder(orderId)));
    }

    @GetMapping("/api/manufacturing")
    @PreAuthorize("hasAnyRole('OPERATION', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ManufacturingOrderResponse>>> getManufacturing(
            @RequestParam(defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                manufacturingOrderService.getByStatus(status)));
    }

    @GetMapping("/api/manufacturing/{id}")
    @PreAuthorize("hasAnyRole('OPERATION', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ManufacturingOrderResponse>> getManufacturingById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(
                manufacturingOrderService.getById(id)));
    }

    @PatchMapping("/api/manufacturing/{id}/status")
    @PreAuthorize("hasRole('OPERATION')")
    public ResponseEntity<ApiResponse<ManufacturingOrderResponse>> updateManufacturingStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateManufacturingStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tiến độ sản xuất thành công",
                manufacturingOrderService.updateStatus(id, request)));
    }

    // ══════════════════════════════════════════
    // SHIPMENT
    // ══════════════════════════════════════════

    @GetMapping("/api/shipments")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getShipments(
            @RequestParam(defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                shipmentService.getByStatus(status)));
    }

    @GetMapping("/api/shipments/me")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>> getMyShipments(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                shipmentService.getMyShipments(currentUser.getAccountId())));
    }

    @GetMapping("/api/shipments/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'SHIPPER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipmentById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(
                shipmentService.getById(id)));
    }

    @PatchMapping("/api/shipments/{id}/assign/{accountId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> assignShipper(
            @PathVariable Integer id,
            @PathVariable Integer accountId) {
        return ResponseEntity.ok(ApiResponse.ok("Đã gán shipper",
                shipmentService.assignShipper(id, accountId)));
    }

    @PatchMapping("/api/shipments/{id}/status")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateShipmentStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái giao hàng thành công",
                shipmentService.updateStatus(id,
                        currentUser.getAccountId(), request)));
    }
}