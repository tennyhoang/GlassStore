package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShipmentResponse {
    private Integer shipmentId;
    private Integer orderId;
    private String customerName;
    private String shippingAddress;
    private String shipperUsername;
    private String status;
    private String trackingNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deliveredAt;
}