package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EyeProfileResponse {
    private Integer eyeProfileId;
    private Integer customerId;
    private String  customerName;
    private String  profileName;
    private String  source;
    private String  status;
    private LocalDateTime createdDate;
    private List<PrescriptionResponse>     prescriptions;
    private List<PrescriptionFileResponse> files;
}