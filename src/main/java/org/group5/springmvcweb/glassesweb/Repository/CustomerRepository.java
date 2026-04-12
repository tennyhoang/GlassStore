package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    // Customer không có field account — dùng JPQL qua Account
    @Query("SELECT c FROM Customer c JOIN Account a ON a.customer.customerId = c.customerId WHERE a.accountId = :accountId")
    Optional<Customer> findByAccountId(@Param("accountId") Integer accountId);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}