package org.group5.springmvcweb.glassesweb.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * RateLimitFilter — áp dụng rate limiting theo IP thực của client.
 *
 * ═══════════════════════════════════════════════════════════════
 * FIX BẢO MẬT: IP Spoofing via X-Forwarded-For
 * ═══════════════════════════════════════════════════════════════
 *
 * LỖ HỔNG CŨ:
 *   Lấy IP từ X-Forwarded-For header mà không kiểm tra nguồn gốc.
 *   Attacker gửi: X-Forwarded-For: 1.2.3.4
 *   → Mỗi request dùng IP giả khác nhau → bypass hoàn toàn rate limit.
 *
 * CÁCH FIX:
 *   Chỉ tin tưởng X-Forwarded-For nếu request đến từ trusted proxy IPs.
 *   Nếu không phải trusted proxy → dùng getRemoteAddr() (IP thực của socket).
 *
 * CẤU HÌNH (application.properties hoặc environment variable):
 *   rate-limit.trusted-proxies=127.0.0.1,::1,10.0.0.1,172.16.0.1
 *   Để trống hoặc không set → không tin X-Forwarded-For từ bất kỳ nguồn nào.
 *
 * THÊM: Memory leak fix — bucket map dùng Caffeine với TTL 1 giờ.
 *   Thay thế ConcurrentHashMap không bao giờ expire bằng cache tự dọn.
 *   Yêu cầu thêm dependency: com.github.ben-manes.caffeine:caffeine:3.1.8
 *
 * ═══════════════════════════════════════════════════════════════
 *
 * Rate limits:
 *   - Login:    10 request/phút/IP
 *   - Register:  5 request/phút/IP
 *   - API chung: 100 request/phút/IP
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;
    private final ObjectMapper    objectMapper;

    /**
     * Danh sách IP của trusted proxies (nginx, load balancer...).
     * Chỉ các IP này mới được tin tưởng khi set X-Forwarded-For.
     *
     * Set qua application.properties:
     *   rate-limit.trusted-proxies=127.0.0.1,::1
     *
     * Mặc định rỗng = không tin bất kỳ proxy nào.
     */
    @Value("${rate-limit.trusted-proxies:}")
    private String trustedProxiesConfig;

    // Cache parsed trusted proxy set (lazy-init, thread-safe via volatile)
    private volatile Set<String> trustedProxySet = null;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip   = getClientIp(request);
        String path = request.getRequestURI();

        Bucket bucket;

        if (path.equals("/api/auth/login")) {
            bucket = rateLimitConfig.getLoginBucket(ip);
        } else if (path.equals("/api/auth/register")) {
            bucket = rateLimitConfig.getRegisterBucket(ip);
        } else if (path.startsWith("/api/")) {
            bucket = rateLimitConfig.getApiBucket(ip);
        } else {
            // Không áp dụng rate limit cho swagger-ui, v3/api-docs, ws/...
            filterChain.doFilter(request, response);
            return;
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            String body = objectMapper.writeValueAsString(
                    ApiResponse.fail("Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút."));
            response.getWriter().write(body);
        }
    }

    /**
     * Lấy IP thực của client với trusted proxy validation.
     *
     * Logic:
     *  1. Lấy remoteAddr (IP thực của socket — không thể giả mạo)
     *  2. Nếu remoteAddr nằm trong danh sách trusted proxies
     *     → tin tưởng X-Forwarded-For, lấy IP đầu tiên (client thực)
     *  3. Nếu không → bỏ qua X-Forwarded-For, dùng remoteAddr
     *
     * Ví dụ nginx config đúng:
     *   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     *   → Header sẽ là: "client_ip, nginx_ip"
     *   → Lấy phần tử đầu tiên = IP thực của client
     */
    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        // Chỉ xử lý X-Forwarded-For nếu request đến từ trusted proxy
        if (isTrustedProxy(remoteAddr)) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                // X-Forwarded-For có thể chứa chuỗi IPs: "client, proxy1, proxy2"
                // → luôn lấy IP đầu tiên (leftmost = client thực)
                String clientIp = forwarded.split(",")[0].trim();
                if (isValidIp(clientIp)) {
                    return clientIp;
                }
            }
        }

        return remoteAddr;
    }

    /**
     * Kiểm tra xem remoteAddr có nằm trong danh sách trusted proxies không.
     * Nếu trustedProxies rỗng (mặc định) → không tin proxy nào → return false.
     */
    private boolean isTrustedProxy(String remoteAddr) {
        Set<String> trusted = getTrustedProxySet();
        if (trusted.isEmpty()) {
            return false;
        }
        // Normalize IPv6 loopback: "0:0:0:0:0:0:0:1" == "::1"
        try {
            InetAddress addr = InetAddress.getByName(remoteAddr);
            return trusted.contains(addr.getHostAddress())
                    || trusted.contains(remoteAddr);
        } catch (UnknownHostException e) {
            return false;
        }
    }

    /**
     * Parse trustedProxiesConfig thành Set (lazy, thread-safe).
     * "127.0.0.1,::1,10.0.0.1" → {"127.0.0.1", "::1", "10.0.0.1"}
     */
    private Set<String> getTrustedProxySet() {
        if (trustedProxySet == null) {
            synchronized (this) {
                if (trustedProxySet == null) {
                    if (trustedProxiesConfig == null || trustedProxiesConfig.isBlank()) {
                        trustedProxySet = Set.of();
                    } else {
                        trustedProxySet = Arrays.stream(trustedProxiesConfig.split(","))
                                .map(String::trim)
                                .filter(s -> !s.isBlank())
                                .collect(Collectors.toUnmodifiableSet());
                    }
                }
            }
        }
        return trustedProxySet;
    }

    /**
     * Validate sơ bộ IP string — tránh bucket key có ký tự đặc biệt.
     * Chỉ cho phép chữ số, dấu chấm, dấu hai chấm (IPv4 và IPv6).
     */
    private boolean isValidIp(String ip) {
        if (ip == null || ip.isBlank() || ip.length() > 45) {
            return false;
        }
        return ip.matches("[0-9a-fA-F:.]+");
    }
}