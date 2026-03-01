package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "EyePrescription")
@Data
public class EyePrescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionId;

    @Column(name = "eye_profile_id")
    private Integer eyeProfileId;

    private String eyeSide; // "left" or "right" or "both"

    private double sph;
    private double cyl;
    private Integer axis;
    private double pd;
    private double add;
}
