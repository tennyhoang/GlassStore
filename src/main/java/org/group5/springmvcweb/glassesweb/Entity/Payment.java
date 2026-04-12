package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment — thanh toán đơn hàng (mock).
 * Mỗi Order có 1 Payment.
 * paymentMethod: CASH, BANK_TRANSFER, MOMO, VNPAY (mock hết)
 * status: PENDING → PAID | FAILED | REFUNDED
 */
@Entity
@Table(name = "Payment")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // CASH, BANK_TRANSFER, MOMO, VNPAY

    @Column(name = "status", length = 50)
    private String status; // PENDING, PAID, FAILED, REFUNDED

    @Column(name = "transaction_ref", length = 255)
    private String transactionRef; // mã giao dịch (mock)

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }
}