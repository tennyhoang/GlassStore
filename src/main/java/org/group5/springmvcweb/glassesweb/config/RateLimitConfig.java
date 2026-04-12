package org.group5.springmvcweb.glassesweb.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting dùng Bucket4j — Token Bucket algorithm.
 *
 * Áp dụng cho:
 * - Login: 10 request/phút/IP — chống brute force
 * - Register: 5 request/phút/IP — chống spam account
 * - API chung: 100 request/phút/IP
 *
 * Không cần Redis — bucket lưu in-memory, đủ dùng cho single-node.
 * Nâng cấp lên Redis Bucket4j khi cần multi-node.
 */
@Configuration
public class RateLimitConfig {

    // Map IP → Bucket cho từng loại endpoint
    private final Map<String, Bucket> loginBuckets    = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiBuckets      = new ConcurrentHashMap<>();

    /** Bucket cho login: 10 request/phút */
    public Bucket getLoginBucket(String ipAddress) {
        return loginBuckets.computeIfAbsent(ipAddress, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(
                                10,
                                Refill.greedy(10, Duration.ofMinutes(1))))
                        .build()
        );
    }

    /** Bucket cho register: 5 request/phút */
    public Bucket getRegisterBucket(String ipAddress) {
        return registerBuckets.computeIfAbsent(ipAddress, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(
                                5,
                                Refill.greedy(5, Duration.ofMinutes(1))))
                        .build()
        );
    }

    /** Bucket cho API chung: 100 request/phút */
    public Bucket getApiBucket(String ipAddress) {
        return apiBuckets.computeIfAbsent(ipAddress, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(
                                100,
                                Refill.greedy(100, Duration.ofMinutes(1))))
                        .build()
        );
    }
}
