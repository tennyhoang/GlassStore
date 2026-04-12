package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FrameResponse {
    private Integer frameId;
    private String name;
    private String brand;
    private String color;
    private String material;
    private String shape;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String status;
}