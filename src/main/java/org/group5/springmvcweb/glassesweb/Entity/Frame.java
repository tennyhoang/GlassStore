package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Frame")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Frame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "frame_id")
    private Integer frameId;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "material", length = 100)
    private String material;

    @Column(name = "shape", length = 100)
    private String shape;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "status", length = 50)
    private String status; // AVAILABLE, DISCONTINUED
}