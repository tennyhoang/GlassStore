package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReadyMadeGlassesResponse {
    private Integer productId;
    private String name;
    private String brand;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String description;
    private String status;
}