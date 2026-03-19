package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "LensOption")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LensOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Integer optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lens_id", nullable = false)
    private Lens lens;

    @Column(name = "option_name", length = 255)
    private String optionName; // Chống UV, Chống ánh sáng xanh, Photochromic...

    @Column(name = "extra_price", precision = 10, scale = 2)
    private BigDecimal extraPrice;
}