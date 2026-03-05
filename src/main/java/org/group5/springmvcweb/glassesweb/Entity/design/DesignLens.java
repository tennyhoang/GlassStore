package org.group5.springmvcweb.glassesweb.Entity.design;

import jakarta.persistence.*;

@Entity
@Table(name = "DesignLens")
public class DesignLens {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_lens_id")
    private Integer designLensId;

    @Column(name = "design_id")
    private Integer designId;

    @Column(name = "eye_side")
    private String eyeSide;

    @Column(name = "lens_id")
    private Integer lensId;

    @Column(name = "lens_option_id")
    private Integer lensOptionId;

    // Getter và Setter
    public Integer getDesignLensId() { return designLensId; }
    public void setDesignLensId(Integer designLensId) { this.designLensId = designLensId; }

    public Integer getDesignId() { return designId; }
    public void setDesignId(Integer designId) { this.designId = designId; }

    public String getEyeSide() { return eyeSide; }
    public void setEyeSide(String eyeSide) { this.eyeSide = eyeSide; }

    public Integer getLensId() { return lensId; }
    public void setLensId(Integer lensId) { this.lensId = lensId; }

    public Integer getLensOptionId() { return lensOptionId; }
    public void setLensOptionId(Integer lensOptionId) { this.lensOptionId = lensOptionId; }
}