package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EyeProfileUploadRequest {

    @NotBlank(message = "URL file không được để trống")
    private String fileUrl;
}