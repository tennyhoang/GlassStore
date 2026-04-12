package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * CartItem — 1 dong trong gio hang.
 * Co the la:
 *   - Kinh theo thiet ke:  designId != null            → itemType = CUSTOM_GLASSES
 *   - Kinh lam san:        readyMadeGlassesId != null  → itemType = READY_MADE
 *   - Chi gong kinh:       frameId != null             → itemType = FRAME_ONLY (THEM MOI)
 */
@Entity
@Table(name = "cart_item")
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

    // Loai 1: kinh theo design
    @Column(name = "design_id")
    private Integer designId;

    // Loai 2: kinh lam san
    @Column(name = "ready_made_glasses_id")
    private Integer readyMadeGlassesId;

    // Loai 3: chi gong kinh (THEM MOI)
    @Column(name = "frame_id")
    private Integer frameId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
}