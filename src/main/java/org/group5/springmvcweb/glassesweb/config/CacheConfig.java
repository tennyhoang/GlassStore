package org.group5.springmvcweb.glassesweb.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Spring Cache — dùng in-memory cache (ConcurrentHashMap).
 *
 * Tại sao dùng in-memory thay vì Redis?
 * - Không cần setup thêm infrastructure
 * - Phù hợp cho project demo / intern
 * - Dữ liệu sản phẩm ít thay đổi → cache hiệu quả
 *
 * Nâng cấp lên Redis (giai đoạn 3):
 * - Thêm spring-boot-starter-data-redis vào pom.xml
 * - Thay ConcurrentMapCacheManager bằng RedisCacheManager
 * - Thêm TTL (time-to-live) cho từng cache
 *
 * Cache hiện tại:
 * - "frames"           → danh sách / chi tiết gọng kính
 * - "lenses"           → danh sách / chi tiết tròng kính
 * - "readyMadeGlasses" → danh sách kính làm sẵn
 *
 * Cache bị xoá khi: create / update / delete (xem @CacheEvict trong ProductService)
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                "frames",
                "lenses",
                "readyMadeGlasses"
        );
    }
}
