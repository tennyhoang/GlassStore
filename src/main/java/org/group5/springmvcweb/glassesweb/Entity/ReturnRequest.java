package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ReturnRequest")
@Getter @Setter                  // ← Phải có @Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "return_id")
    private Integer returnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "reason", length = 1000, nullable = false)
    private String reason;

    @Column(name = "return_type", length = 50)
    @Enumerated(EnumType.STRING)
    private ReturnType returnType;

    @Column(name = "status", length = 50)
    @Enumerated(EnumType.STRING)
    private ReturnStatus status;

    @Column(name = "staff_note", length = 1000)
    private String staffNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = ReturnStatus.PENDING;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ReturnType   { EXCHANGE, REFUND, WARRANTY }
    public enum ReturnStatus { PENDING, APPROVED, REJECTED, COMPLETED }
}