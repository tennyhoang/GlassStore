package org.group5.springmvcweb.glassesweb.Entity.eye;

import jakarta.persistence.*;

@Entity
@Table(name = "EyePrescription")
public class EyePrescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionId;

    @Column(name = "eye_profile_id")
    private Integer eyeProfileId;

    private String eyeSide; // "LEFT", "RIGHT", "BOTH"

    private double sph;
    private double cyl;
    private Integer axis;
    private double pd;
    private double add;

    public Integer getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Integer prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public Integer getEyeProfileId() {
        return eyeProfileId;
    }

    public void setEyeProfileId(Integer eyeProfileId) {
        this.eyeProfileId = eyeProfileId;
    }

    public String getEyeSide() {
        return eyeSide;
    }

    public void setEyeSide(String eyeSide) {
        this.eyeSide = eyeSide;
    }

    public double getSph() {
        return sph;
    }

    public void setSph(double sph) {
        this.sph = sph;
    }

    public double getCyl() {
        return cyl;
    }

    public void setCyl(double cyl) {
        this.cyl = cyl;
    }

    public Integer getAxis() {
        return axis;
    }

    public void setAxis(Integer axis) {
        this.axis = axis;
    }

    public double getPd() {
        return pd;
    }

    public void setPd(double pd) {
        this.pd = pd;
    }

    public double getAdd() {
        return add;
    }

    public void setAdd(double add) {
        this.add = add;
    }
}