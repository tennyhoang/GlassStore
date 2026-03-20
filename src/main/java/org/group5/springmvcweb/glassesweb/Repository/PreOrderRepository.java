package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.PreOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PreOrderRepository extends JpaRepository<PreOrder, Integer> {
    List<PreOrder> findByCustomer_CustomerIdOrderByCreatedAtDesc(Integer customerId);
    List<PreOrder> findByStatusOrderByCreatedAtDesc(String status);
    List<PreOrder> findAllByOrderByCreatedAtDesc();
}