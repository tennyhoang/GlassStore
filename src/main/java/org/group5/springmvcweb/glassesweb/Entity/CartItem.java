package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * CartItem — 1 dòng trong giỏ hàng.
 * Có thể là:
 *   - Kính theo thiết kế: designId != null
 *   - Kính làm sẵn:       readyMadeGlassesId != null
 */
@Entity
@Table(name = "CartItem")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Integer cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // Loại 1: kính theo design
    @Column(name = "design_id")
    private Integer designId;

    // Loại 2: kính làm sẵn
    @Column(name = "ready_made_glasses_id")
    private Integer readyMadeGlassesId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
}