package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ReadyMadeGlasses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReadyMadeGlasses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "status", length = 50)
    private String status; // AVAILABLE, DISCONTINUED
}