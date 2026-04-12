package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * ManufacturingOrder — lệnh sản xuất.
 * STAFF tạo khi Order chuyển sang CONFIRMED.
 * OPERATION nhận và cập nhật trạng thái sản xuất.
 *
 * status: PENDING → IN_PROGRESS → COMPLETED
 */
@Entity
@Table(name = "ManufacturingOrder")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ManufacturingOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manufacturing_id")
    private Integer manufacturingId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "status", length = 50)
    private String status; // PENDING, IN_PROGRESS, COMPLETED

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

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