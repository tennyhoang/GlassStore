package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GlassesDesignResponse {
    private Integer designId;
    private Integer customerId;
    private String customerName;

    // EyeProfile summary
    private Integer eyeProfileId;

    // Frame summary
    private Integer frameId;
    private String frameName;
    private String frameBrand;
    private String frameColor;
    private BigDecimal framePrice;

    // Lens summary
    private Integer lensId;
    private String lensName;
    private String lensType;
    private BigDecimal lensPrice;

    // Options chọn thêm
    private List<GlassesDesignOptionResponse> selectedOptions;

    private BigDecimal totalPrice;
    private String designName;
    private String status;
    private LocalDateTime createdDate;
}