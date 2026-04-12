package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PreOrder — đặt trước khi sản phẩm hết hàng
 * Luồng: PENDING → CONFIRMED → STOCK_RECEIVED → PROCESSING → READY → DELIVERED | CANCELLED
 */
@Entity
@Table(name = "pre_order")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PreOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pre_order_id")
    private Integer preOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frame_id")
    private Frame frame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ready_made_glasses_id")
    private ReadyMadeGlasses readyMadeGlasses;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount; // Tiền đặt cọc (30%)

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", length = 50)
    private String status;
    // PENDING → CONFIRMED → STOCK_RECEIVED → PROCESSING → READY → DELIVERED | CANCELLED

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "expected_date")
    private LocalDateTime expectedDate; // Ngày dự kiến có hàng

    @Column(name = "staff_note", length = 500)
    private String staffNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
        if (this.quantity == null) this.quantity = 1;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}