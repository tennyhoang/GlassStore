package org.group5.springmvcweb.glassesweb.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByUsername(String username);
    boolean existsByUsername(String username);

}