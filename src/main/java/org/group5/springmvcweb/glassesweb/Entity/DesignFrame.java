package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "DesignFrame")
@Data
public class DesignFrame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_frame_id")
    private Integer designFrameId;

    @Column(name = "design_id")
    private Integer designId;
}


