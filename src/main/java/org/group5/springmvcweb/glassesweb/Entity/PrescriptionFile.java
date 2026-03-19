package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PrescriptionFile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PrescriptionFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Integer fileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eye_profile_id", nullable = false)
    private EyeProfile eyeProfile;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @PrePersist
    public void prePersist() {
        this.uploadDate = LocalDateTime.now();
    }
}