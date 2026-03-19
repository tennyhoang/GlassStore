package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomer_CustomerIdOrderByCreatedAtDesc(Integer customerId);
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByOrderIdAndCustomer_CustomerId(Integer orderId, Integer customerId);
}