package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer>,
        JpaSpecificationExecutor<Order> {

    List<Order> findByCustomer_CustomerIdOrderByCreatedAtDesc(Integer customerId);

    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    boolean existsByOrderIdAndCustomer_CustomerId(Integer orderId, Integer customerId);

    /**
     * Search don hang cho staff voi full-text tren ten, sdt, ma don.
     * Dung LIKE thay vi Elasticsearch vi du an chua co infra.
     * Pagination + sort xu ly qua Pageable.
     */
    @Query("""
        SELECT o FROM Order o
        JOIN o.customer c
        WHERE
            (:status IS NULL OR o.status = :status)
            AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(c.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR CAST(o.orderId AS string) LIKE CONCAT('%', :keyword, '%')
            )
            AND (:minAmount IS NULL OR o.finalAmount >= :minAmount)
            AND (:maxAmount IS NULL OR o.finalAmount <= :maxAmount)
        """)
    Page<Order> searchOrders(
            @Param("keyword")   String keyword,
            @Param("status")    String status,
            @Param("minAmount") java.math.BigDecimal minAmount,
            @Param("maxAmount") java.math.BigDecimal maxAmount,
            Pageable pageable
    );
}