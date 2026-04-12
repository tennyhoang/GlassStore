package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByAccount_AccountIdOrderByCreatedAtDesc(Integer accountId);

    long countByAccount_AccountIdAndReadFalse(Integer accountId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.account.accountId = :accountId")
    void markAllReadByAccountId(@Param("accountId") Integer accountId);
}