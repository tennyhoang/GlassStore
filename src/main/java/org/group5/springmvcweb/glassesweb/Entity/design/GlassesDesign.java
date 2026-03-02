package org.group5.springmvcweb.glassesweb.Entity.design;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "GlassesDesign")
@Data
public class GlassesDesign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer designId;

    @Column(name = "eye_profile_id")
    private Integer eyeProfileId;

    @Column(name = "create_date")
    private LocalDateTime createDate = LocalDateTime.now();

    private String status;
}
