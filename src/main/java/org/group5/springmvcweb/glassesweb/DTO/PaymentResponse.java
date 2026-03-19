package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {
    private Integer paymentId;
    private Integer orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String transactionRef;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}