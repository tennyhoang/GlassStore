package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LensResponse {
    private Integer lensId;
    private String name;
    private String lensType;
    private String material;
    private Double indexValue;
    private BigDecimal price;
    private String status;
    private List<LensOptionResponse> options;
}