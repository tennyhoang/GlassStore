package org.group5.springmvcweb.glassesweb.Entity.design;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "GlassesDesign")
public class GlassesDesign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_id")
    private Integer designId;

    @Column(name = "eye_profile_id")
    private Integer eyeProfileId;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    private String status;

    public Integer getDesignId() { return designId; }
    public void setDesignId(Integer designId) { this.designId = designId; }

    public Integer getEyeProfileId() { return eyeProfileId; }
    public void setEyeProfileId(Integer eyeProfileId) { this.eyeProfileId = eyeProfileId; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}