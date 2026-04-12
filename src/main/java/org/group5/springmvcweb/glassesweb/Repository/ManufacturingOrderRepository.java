package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.ManufacturingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ManufacturingOrderRepository extends JpaRepository<ManufacturingOrder, Integer> {
    Optional<ManufacturingOrder> findByOrder_OrderId(Integer orderId);
    List<ManufacturingOrder> findByStatusOrderByCreatedAtDesc(String status);
}