package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "Lens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Lens {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lens_id")
    private Integer lensId;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "lens_type", length = 100)
    private String lensType; // SINGLE_VISION, BIFOCAL, PROGRESSIVE, BLUE_LIGHT

    @Column(name = "material", length = 100)
    private String material;

    @Column(name = "index_value")
    private Double indexValue; // 1.5, 1.56, 1.61, 1.67, 1.74

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "status", length = 50)
    private String status; // AVAILABLE, DISCONTINUED

    @OneToMany(mappedBy = "lens", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LensOption> options;
}