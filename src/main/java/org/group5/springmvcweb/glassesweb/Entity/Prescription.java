package org.group5.springmvcweb.glassesweb.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Prescription")
@Data
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Integer fileId;

    @Column(name = "eye_profile_id")
    private Integer eyeProfileId;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate = LocalDateTime.now();
}
