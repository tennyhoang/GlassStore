package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * MyGlasses — kính đã đặt hàng & nhận được của customer.
 * Được tạo tự động khi Order chuyển sang DELIVERED.
 */
@Entity
@Table(name = "MyGlasses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MyGlasses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "my_glasses_id")
    private Integer myGlassesId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_id")
    private GlassesDesign glassesDesign; // null nếu là ReadyMadeGlasses

    @Column(name = "order_id")
    private Integer orderId; // tham chiếu ngược về Order

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @Column(name = "notes", length = 500)
    private String notes;
}