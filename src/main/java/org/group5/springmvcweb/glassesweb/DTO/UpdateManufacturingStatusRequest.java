package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateManufacturingStatusRequest {
    @NotBlank(message = "Status không được để trống")
    private String status; // IN_PROGRESS, COMPLETED
    private String notes;
}