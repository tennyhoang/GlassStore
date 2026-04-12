package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.GlassesDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GlassesDesignRepository extends JpaRepository<GlassesDesign, Integer> {

    // Tất cả design của customer
    List<GlassesDesign> findByCustomer_CustomerIdOrderByCreatedDateDesc(Integer customerId);

    // Design theo status (DRAFT / ORDERED)
    List<GlassesDesign> findByCustomer_CustomerIdAndStatus(Integer customerId, String status);

    // Kiểm tra design có thuộc customer không
    boolean existsByDesignIdAndCustomer_CustomerId(Integer designId, Integer customerId);
}