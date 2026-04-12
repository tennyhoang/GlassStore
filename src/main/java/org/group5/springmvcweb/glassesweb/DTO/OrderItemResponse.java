package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItemResponse {
    private Integer    orderItemId;
    private String     itemType;
    private Integer    designId;
    private Integer    readyMadeGlassesId;
    private Integer    quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String     productSnapshot;

    // Cac truong parse san tu productSnapshot — frontend khong can tu parse JSON
    private String     productName;
    private String     frameName;
    private String     lensName;
    private String     brand;
}