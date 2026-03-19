package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Discount — mã giảm giá.
 * discountType: PERCENTAGE hoặc FIXED
 * status: ACTIVE, INACTIVE
 */
@Entity
@Table(name = "Discount")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    private Integer discountId;

    @Column(name = "code", length = 50, unique = true, nullable = false)
    private String code;

    @Column(name = "discount_type", length = 20)
    private String discountType;        // "PERCENTAGE" | "FIXED"

    @Column(name = "discount_value", precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    private Integer usedCount;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "status", length = 50)
    private String status;              // "ACTIVE" | "INACTIVE"

    @PrePersist
    public void prePersist() {
        if (this.usedCount == null) this.usedCount = 0;
        if (this.status == null)    this.status    = "ACTIVE";
    }
}