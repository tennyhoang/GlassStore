package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MyGlassesResponse {
    private Integer myGlassesId;
    private Integer customerId;
    private Integer orderId;
    private GlassesDesignResponse design;
    private LocalDateTime receivedDate;
    private String notes;
}