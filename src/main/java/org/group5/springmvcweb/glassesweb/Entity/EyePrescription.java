package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "EyePrescription")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EyePrescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prescription_id")
    private Integer prescriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eye_profile_id", nullable = false)
    private EyeProfile eyeProfile;

    @Column(name = "eye_side", length = 10)
    @Enumerated(EnumType.STRING)
    private EyeSide eyeSide; // LEFT, RIGHT

    // FIX: Double không dùng precision+scale được trong Hibernate 6
    // Đổi sang BigDecimal để dùng precision+scale đúng cách
    @Column(name = "sph", precision = 5, scale = 2)
    private BigDecimal sph;

    @Column(name = "cyl", precision = 5, scale = 2)
    private BigDecimal cyl;

    @Column(name = "axis")
    private Integer axis;

    @Column(name = "pd", precision = 5, scale = 2)
    private BigDecimal pd;

    @Column(name = "[add]", precision = 5, scale = 2)
    private BigDecimal add;

    public enum EyeSide {
        LEFT, RIGHT
    }
}