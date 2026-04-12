package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EyeProfileManualRequest {

    @NotBlank(message = "Vui lòng đặt tên cho hồ sơ mắt")
    @Size(max = 255)
    private String profileName;

    @NotNull(message = "Vui lòng nhập thông tin mắt phải")
    @Valid
    private PrescriptionRequest rightEye;

    @NotNull(message = "Vui lòng nhập thông tin mắt trái")
    @Valid
    private PrescriptionRequest leftEye;
}