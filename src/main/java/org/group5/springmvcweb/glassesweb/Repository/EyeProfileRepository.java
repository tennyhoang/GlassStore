package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.EyeProfile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EyeProfileRepository extends JpaRepository<EyeProfile, Integer> {

    // Lấy tất cả hồ sơ mắt của một customer
    List<EyeProfile> findByCustomer_CustomerIdOrderByCreatedDateDesc(Integer customerId);

    // Lấy hồ sơ mắt theo status của customer
    List<EyeProfile> findByCustomer_CustomerIdAndStatus(
            Integer customerId,
            EyeProfile.EyeProfileStatus status
    );

    // Lấy hồ sơ mắt mới nhất của customer (dùng khi thiết kế kính)
    // FIX: JPQL không hỗ trợ LIMIT — dùng Pageable, gọi với PageRequest.of(0, 1)
    @Query("""
        SELECT ep FROM EyeProfile ep
        WHERE ep.customer.customerId = :customerId
          AND ep.status = 'ACTIVE'
        ORDER BY ep.createdDate DESC
    """)
    List<EyeProfile> findLatestActiveByCustomerIdList(
            @Param("customerId") Integer customerId,
            Pageable pageable
    );

    // Kiểm tra hồ sơ có thuộc customer không (dùng cho security check)
    boolean existsByEyeProfileIdAndCustomer_CustomerId(
            Integer eyeProfileId,
            Integer customerId
    );
}