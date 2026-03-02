package org.group5.springmvcweb.glassesweb.Entity.eye;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PrescriptionFile")
public class PrescriptionFile {
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

    public Integer getFileId() {
        return fileId;
    }

    public void setFileId(Integer fileId) {
        this.fileId = fileId;
    }

    public Integer getEyeProfileId() {
        return eyeProfileId;
    }

    public void setEyeProfileId(Integer eyeProfileId) {
        this.eyeProfileId = eyeProfileId;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
}