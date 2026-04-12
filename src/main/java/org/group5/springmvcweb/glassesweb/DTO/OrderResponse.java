package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * OrderResponse v2 — them cac truong:
 *   - customerPhone : so dien thoai khach hang
 *   - statusHistory : list timestamp cac moc chuyen trang thai (simulate tu createdAt + updatedAt)
 *   - shipmentStatus: trang thai giao hang hien tai (PENDING / DELIVERING / DELIVERED / FAILED)
 *   - shipmentNote  : ghi chu cua shipper
 *   - deliveredAt   : thoi diem giao hang thanh cong
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderResponse {

    // ── thong tin co ban ─────────────────────────────────────────────────────
    private Integer   orderId;
    private Integer   customerId;
    private String    customerName;
    private String    customerPhone;      // THEM MOI

    // ── trang thai ───────────────────────────────────────────────────────────
    private String    status;

    // ── tai chinh ────────────────────────────────────────────────────────────
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String    discountCode;

    // ── giao hang ────────────────────────────────────────────────────────────
    private String    shippingAddress;
    private String    shipmentStatus;     // THEM MOI
    private String    shipmentNote;       // THEM MOI — ghi chu shipper
    private LocalDateTime deliveredAt;   // THEM MOI

    // ── khac ─────────────────────────────────────────────────────────────────
    private String    note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── san pham ─────────────────────────────────────────────────────────────
    private List<OrderItemResponse> items;
}