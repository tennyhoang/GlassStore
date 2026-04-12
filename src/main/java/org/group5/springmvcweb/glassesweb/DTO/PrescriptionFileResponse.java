package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PrescriptionFileResponse {
    private Integer fileId;
    private String fileUrl;
    private LocalDateTime uploadDate;
}