package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.group5.springmvcweb.glassesweb.Entity.EyeProfile;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class EyeProfileStatusRequest {

    @NotNull(message = "Status không được để trống")
    private EyeProfile.EyeProfileStatus status;
}