package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.RefreshToken;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Quản lý refresh token — tạo, xác thực, revoke.
 *
 * Refresh token là UUID ngẫu nhiên, lưu vào DB kèm expiry.
 * Khác access token (JWT tự verify), refresh token cần tra DB → có thể revoke được.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_DAYS = 7;

    private final RefreshTokenRepository refreshTokenRepository;
    private final AccountRepository      accountRepository;

    /**
     * Tạo refresh token mới cho account.
     * Xoá token cũ của account trước để mỗi account chỉ có 1 token active.
     */
    @Transactional
    public RefreshToken createRefreshToken(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        // Xoá token cũ — mỗi account chỉ có 1 refresh token active
        refreshTokenRepository.deleteByAccountId(accountId);

        RefreshToken token = RefreshToken.builder()
                .account(account)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_DAYS))
                .build();

        return refreshTokenRepository.save(token);
    }

    /**
     * Xác thực refresh token.
     * Ném RuntimeException nếu không tìm thấy hoặc đã hết hạn.
     */
    @Transactional
    public RefreshToken verifyRefreshToken(String tokenValue) {
        RefreshToken token = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ"));

        if (token.isExpired()) {
            // Xoá token hết hạn khỏi DB
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        return token;
    }

    /** Xoá tất cả refresh token của account — dùng khi logout */
    @Transactional
    public void revokeAllByAccountId(Integer accountId) {
        refreshTokenRepository.deleteByAccountId(accountId);
    }

    /**
     * Scheduled task — dọn token hết hạn mỗi ngày lúc 2:00 AM.
     * Tránh DB bị đầy bởi token cũ.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens();
    }
}
