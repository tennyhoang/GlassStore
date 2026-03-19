package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Shipment — đơn giao hàng.
 * Tạo khi ManufacturingOrder COMPLETED → Order chuyển sang SHIPPING.
 * SHIPPER nhận và cập nhật trạng thái giao hàng.
 *
 * status: PENDING → PICKED_UP → DELIVERING → DELIVERED | FAILED
 */
@Entity
@Table(name = "Shipment")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shipment_id")
    private Integer shipmentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipper_account_id")
    private Account shipper; // Account với role SHIPPER

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "status", length = 50)
    private String status; // PENDING, PICKED_UP, DELIVERING, DELIVERED, FAILED

    @Column(name = "tracking_note", length = 500)
    private String trackingNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}