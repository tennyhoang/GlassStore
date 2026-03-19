package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartResponse {
    private Integer cartId;
    private Integer customerId;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
}