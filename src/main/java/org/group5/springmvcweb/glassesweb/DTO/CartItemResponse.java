package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemResponse {
    private Integer    cartItemId;
    private String     itemType;           // CUSTOM_GLASSES | READY_MADE | FRAME_ONLY
    private Integer    designId;
    private String     designName;
    private Integer    readyMadeGlassesId;
    private String     productName;
    private Integer    frameId;            // THEM MOI
    private String     frameName;          // THEM MOI
    private Integer    quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}