package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

    Optional<RefreshToken> findByToken(String token);

    /** Xoá tất cả refresh token của account — dùng khi logout */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.account.accountId = :accountId")
    void deleteByAccountId(@Param("accountId") Integer accountId);

    /** Xoá token đã hết hạn — có thể schedule cleanup định kỳ */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpiredTokens();
}
