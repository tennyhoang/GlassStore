package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ManufacturingOrderResponse {
    private Integer manufacturingId;
    private Integer orderId;
    private String customerName;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}