package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PrescriptionResponse {
    private Integer prescriptionId;
    private String eyeSide;   // LEFT, RIGHT
    private BigDecimal sph;
    private BigDecimal cyl;
    private Integer axis;
    private BigDecimal pd;
    private BigDecimal add;
}