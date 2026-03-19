package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LensOptionRequest {
    @NotBlank(message = "Tên tùy chọn không được để trống")
    private String optionName;
    @NotNull(message = "Giá thêm không được để trống")
    @DecimalMin(value = "0.0", message = "Giá thêm phải >= 0")
    private BigDecimal extraPrice;
}