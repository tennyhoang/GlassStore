package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * AddToCartRequest — them san pham vao gio hang.
 *
 * Chi duoc co dung 1 trong 3 loai:
 *   - designId            → Kinh theo thiet ke (CUSTOM_GLASSES)
 *   - readyMadeGlassesId  → Kinh lam san (READY_MADE)
 *   - frameId             → Chi gong kinh (FRAME_ONLY)
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddToCartRequest {

    private Integer designId;
    private Integer readyMadeGlassesId;
    private Integer frameId;  // THEM MOI — chi mua gong

    @NotNull(message = "So luong khong duoc de trong")
    @Min(value = 1, message = "So luong phai >= 1")
    private Integer quantity;
}