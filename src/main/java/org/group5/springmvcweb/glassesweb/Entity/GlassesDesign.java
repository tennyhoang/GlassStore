package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * GlassesDesign — bản thiết kế kính của customer.
 * Customer chọn: Frame + Lens + EyeProfile + LensOptions (tuỳ chọn)
 * Sau khi đặt hàng thành công → lưu vào MyGlasses.
 */
@Entity
@Table(name = "GlassesDesign")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GlassesDesign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_id")
    private Integer designId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "eye_profile_id", nullable = false)
    private EyeProfile eyeProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frame_id", nullable = false)
    private Frame frame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lens_id", nullable = false)
    private Lens lens;

    // Tổng giá tại thời điểm thiết kế (frame + lens + options)
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "design_name", length = 255)
    private String designName; // tên do customer đặt (tuỳ chọn)

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "status", length = 50)
    private String status; // DRAFT, ORDERED

    // Các LensOption được chọn thêm
    @OneToMany(mappedBy = "glassesDesign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GlassesDesignOption> selectedOptions;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        if (this.status == null) this.status = "DRAFT";
    }
}