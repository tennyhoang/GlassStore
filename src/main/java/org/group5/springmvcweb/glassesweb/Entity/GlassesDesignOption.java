package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * GlassesDesignOption — các LensOption customer chọn thêm cho 1 design.
 * Lưu snapshot optionName + extraPrice tại thời điểm chọn.
 */
@Entity
@Table(name = "GlassesDesignOption")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GlassesDesignOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_option_id")
    private Integer designOptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_id", nullable = false)
    private GlassesDesign glassesDesign;

    @Column(name = "option_id")
    private Integer optionId;

    @Column(name = "option_name", length = 255)
    private String optionName; // snapshot

    @Column(name = "extra_price", precision = 10, scale = 2)
    private BigDecimal extraPrice; // snapshot
}