package org.group5.springmvcweb.glassesweb.Entity.design;

import jakarta.persistence.*;

@Entity
@Table(name = "DesignFrame")
public class DesignFrame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_frame_id")
    private Integer designFrameId;

    @Column(name = "design_id")
    private Integer designId;

    @Column(name = "frame_id")
    private Integer frameId;

    // Getter và Setter
    public Integer getDesignFrameId() {
        return designFrameId;
    }

    public void setDesignFrameId(Integer designFrameId) {
        this.designFrameId = designFrameId;
    }

    public Integer getDesignId() {
        return designId;
    }

    public void setDesignId(Integer designId) {
        this.designId = designId;
    }

    public Integer getFrameId() {
        return frameId;
    }

    public void setFrameId(Integer frameId) {
        this.frameId = frameId;
    }
}