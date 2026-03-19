package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Cart — giỏ hàng của customer.
 * Mỗi customer chỉ có 1 Cart duy nhất (tạo lúc register hoặc lần đầu thêm hàng).
 */
@Entity
@Table(name = "Cart")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Integer cartId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY,
            orphanRemoval = true)
    private List<CartItem> items;
}