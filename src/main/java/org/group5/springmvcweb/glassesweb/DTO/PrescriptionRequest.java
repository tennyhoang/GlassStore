package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.*;
import org.group5.springmvcweb.glassesweb.Entity.EyePrescription;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PrescriptionRequest {

    @NotNull(message = "Vui lòng chọn mắt (LEFT/RIGHT)")
    private EyePrescription.EyeSide eyeSide;

    @DecimalMin(value = "-20.00", message = "SPH tối thiểu là -20.00")
    @DecimalMax(value = "20.00",  message = "SPH tối đa là +20.00")
    private BigDecimal sph;

    @DecimalMin(value = "-10.00", message = "CYL tối thiểu là -10.00")
    @DecimalMax(value = "0.00",   message = "CYL phải là số âm hoặc 0")
    private BigDecimal cyl;

    @Min(value = 0,   message = "Axis tối thiểu là 0")
    @Max(value = 180, message = "Axis tối đa là 180")
    private Integer axis;

    @DecimalMin(value = "50.00", message = "PD tối thiểu là 50mm")
    @DecimalMax(value = "80.00", message = "PD tối đa là 80mm")
    private BigDecimal pd;

    @DecimalMin(value = "0.00", message = "ADD phải là số dương")
    @DecimalMax(value = "4.00", message = "ADD tối đa là +4.00")
    private BigDecimal add;
}