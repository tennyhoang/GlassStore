package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddToCartRequest {
    // Một trong 2 phải có giá trị
    private Integer designId;
    private Integer readyMadeGlassesId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải >= 1")
    private Integer quantity;
}