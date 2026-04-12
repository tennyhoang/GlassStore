package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {
    Optional<Shipment> findByOrder_OrderId(Integer orderId);
    List<Shipment> findByStatusOrderByCreatedAtDesc(String status);
    List<Shipment> findByShipper_AccountIdOrderByCreatedAtDesc(Integer accountId);
}