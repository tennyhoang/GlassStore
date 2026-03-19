package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FrameRequest {
    @NotBlank(message = "Tên gọng không được để trống")
    private String name;
    private String brand;
    private String color;
    private String material;
    private String shape;
    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", message = "Giá phải >= 0")
    private BigDecimal price;
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng phải >= 0")
    private Integer stockQuantity;
    private String imageUrl;
}