package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GlassesDesignOptionResponse {
    private Integer designOptionId;
    private Integer optionId;
    private String optionName;
    private BigDecimal extraPrice;
}