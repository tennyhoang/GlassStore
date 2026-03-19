package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemResponse {
    private Integer cartItemId;
    private String itemType;       // CUSTOM_GLASSES, READY_MADE
    private Integer designId;
    private String designName;
    private Integer readyMadeGlassesId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}