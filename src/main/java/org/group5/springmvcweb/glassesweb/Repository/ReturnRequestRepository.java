package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Integer> {
    List<ReturnRequest> findByCustomer_CustomerIdOrderByCreatedAtDesc(Integer customerId);
    List<ReturnRequest> findByStatusOrderByCreatedAtDesc(ReturnRequest.ReturnStatus status);
    boolean existsByOrder_OrderIdAndCustomer_CustomerId(Integer orderId, Integer customerId);
}