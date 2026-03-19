package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LensOptionResponse {
    private Integer optionId;
    private String optionName;
    private BigDecimal extraPrice;
}