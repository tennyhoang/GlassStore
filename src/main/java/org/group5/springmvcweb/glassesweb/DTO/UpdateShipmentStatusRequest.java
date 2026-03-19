package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateShipmentStatusRequest {
    @NotBlank(message = "Status không được để trống")
    private String status; // PICKED_UP, DELIVERING, DELIVERED, FAILED
    private String trackingNote;
}