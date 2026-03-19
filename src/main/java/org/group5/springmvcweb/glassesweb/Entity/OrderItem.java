package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * OrderItem — 1 dòng trong đơn hàng.
 * productSnapshot lưu JSON mô tả sản phẩm tại thời điểm đặt
 * (để tránh thay đổi khi sản phẩm bị sửa/xoá sau này).
 */
@Entity
@Table(name = "OrderItem")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Integer orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Loại sản phẩm
    @Column(name = "item_type", length = 50)
    private String itemType; // CUSTOM_GLASSES, READY_MADE

    // FK tuỳ theo loại
    @Column(name = "design_id")
    private Integer designId;

    @Column(name = "ready_made_glasses_id")
    private Integer readyMadeGlassesId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    // JSON snapshot: tên sản phẩm, frame, lens, options tại thời điểm đặt
    @Column(name = "product_snapshot", columnDefinition = "NVARCHAR(MAX)")
    private String productSnapshot;
}