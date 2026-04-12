package org.group5.springmvcweb.glassesweb;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import org.group5.springmvcweb.glassesweb.config.RateLimitConfig;
import org.group5.springmvcweb.glassesweb.config.RateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Unit test cho RateLimitFilter — kiem tra fix bao mat IP Spoofing.
 *
 * Root cause loi cu: doFilterInternal() la protected trong OncePerRequestFilter
 * -> khong the goi truc tiep tu test khac package.
 *
 * Cach fix: dung MockHttpServletRequest / MockHttpServletResponse (Spring Test)
 * va goi doFilter() (public) thay the. OncePerRequestFilter.doFilter() tu dong
 * delegate xuong doFilterInternal() ben trong.
 *
 * Them dependency vao pom.xml (da co san neu dung spring-boot-starter-test):
 *   <dependency>
 *       <groupId>org.springframework</groupId>
 *       <artifactId>spring-test</artifactId>
 *       <scope>test</scope>
 *   </dependency>
 *
 * Cach chay: mvn test -Dtest=RateLimitFilterTest
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RateLimitFilter — Security Tests")
class RateLimitFilterTest {

    @Mock private RateLimitConfig rateLimitConfig;
    @Mock private Bucket          bucket;

    @InjectMocks
    private RateLimitFilter rateLimitFilter;

    private MockHttpServletRequest  req;
    private MockHttpServletResponse res;
    private MockFilterChain         chain;

    @BeforeEach
    void setUp() throws Exception {
        // Inject ObjectMapper that — khong mock, dung ban than
        Field omField = RateLimitFilter.class.getDeclaredField("objectMapper");
        omField.setAccessible(true);
        omField.set(rateLimitFilter, new ObjectMapper());

        req   = new MockHttpServletRequest();
        res   = new MockHttpServletResponse();
        chain = new MockFilterChain();
    }

    /** Inject trustedProxiesConfig va reset cached set qua reflection */
    private void setTrustedProxies(String value) throws Exception {
        Field configField = RateLimitFilter.class.getDeclaredField("trustedProxiesConfig");
        configField.setAccessible(true);
        configField.set(rateLimitFilter, value);

        Field setField = RateLimitFilter.class.getDeclaredField("trustedProxySet");
        setField.setAccessible(true);
        setField.set(rateLimitFilter, null);
    }

    // ════════════════════════════════════════════════════════════════
    // IP Resolution — trusted proxy
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("IP resolution — trusted proxy")
    class TrustedProxyTests {

        @Test
        @DisplayName("request tu trusted proxy + X-Forwarded-For -> dung XFF IP")
        void trustedProxy_usesForwardedIp() throws Exception {
            setTrustedProxies("127.0.0.1");

            req.setRequestURI("/api/auth/login");
            req.setRemoteAddr("127.0.0.1");
            req.addHeader("X-Forwarded-For", "203.0.113.42");

            when(rateLimitConfig.getLoginBucket("203.0.113.42")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(true);

            rateLimitFilter.doFilter(req, res, chain);

            verify(rateLimitConfig).getLoginBucket("203.0.113.42");
            assertThat(chain.getRequest()).isNotNull(); // filter chain da duoc goi
        }

        @Test
        @DisplayName("XFF chua nhieu proxy -> chi lay IP dau tien (client that)")
        void trustedProxy_multipleXff_takesFirstIp() throws Exception {
            setTrustedProxies("10.0.0.1");

            req.setRequestURI("/api/auth/login");
            req.setRemoteAddr("10.0.0.1");
            // chuoi: client -> proxy1 -> nginx (10.0.0.1)
            req.addHeader("X-Forwarded-For", "198.51.100.5, 10.0.0.2, 10.0.0.1");

            when(rateLimitConfig.getLoginBucket("198.51.100.5")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(true);

            rateLimitFilter.doFilter(req, res, chain);

            verify(rateLimitConfig).getLoginBucket("198.51.100.5");
        }
    }

    // ════════════════════════════════════════════════════════════════
    // IP Spoofing prevention — security critical
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("IP Spoofing prevention — security critical")
    class AntiSpoofingTests {

        @Test
        @DisplayName("ATTACK: gia X-Forwarded-For tu nguon khong tin tuong -> bi bo qua")
        void untrustedSource_ignoresForwardedHeader() throws Exception {
            setTrustedProxies(""); // khong co trusted proxy nao

            req.setRequestURI("/api/auth/login");
            req.setRemoteAddr("1.2.3.4");                // IP that cua attacker
            req.addHeader("X-Forwarded-For", "9.9.9.9"); // IP gia mao

            when(rateLimitConfig.getLoginBucket("1.2.3.4")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(true);

            rateLimitFilter.doFilter(req, res, chain);

            // PHAI dung IP that (1.2.3.4), bo qua IP gia (9.9.9.9)
            verify(rateLimitConfig).getLoginBucket("1.2.3.4");
            verify(rateLimitConfig, never()).getLoginBucket("9.9.9.9");
        }

        @Test
        @DisplayName("ATTACK: non-proxy gia XFF -> bi rate-limit dung IP that, nhan 429")
        void nonProxyIp_withSpoofedXff_rateLimitedByRealIp() throws Exception {
            setTrustedProxies("10.0.0.1"); // chi 10.0.0.1 duoc trust

            req.setRequestURI("/api/auth/login");
            req.setRemoteAddr("5.6.7.8");                // IP that cua attacker
            req.addHeader("X-Forwarded-For", "1.1.1.1"); // gia mao

            when(rateLimitConfig.getLoginBucket("5.6.7.8")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(false); // het quota

            rateLimitFilter.doFilter(req, res, chain);

            assertThat(res.getStatus()).isEqualTo(429);
            assertThat(chain.getRequest()).isNull(); // filter chain khong duoc tiep tuc
            verify(rateLimitConfig, never()).getLoginBucket("1.1.1.1"); // IP gia khong duoc dung
        }

        @Test
        @DisplayName("khong co X-Forwarded-For -> dung remoteAddr binh thuong")
        void noForwardedHeader_usesRemoteAddr() throws Exception {
            setTrustedProxies("127.0.0.1");

            req.setRequestURI("/api/products");
            req.setRemoteAddr("192.168.1.100");
            // khong set header X-Forwarded-For

            when(rateLimitConfig.getApiBucket("192.168.1.100")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(true);

            rateLimitFilter.doFilter(req, res, chain);

            verify(rateLimitConfig).getApiBucket("192.168.1.100");
            assertThat(chain.getRequest()).isNotNull();
        }
    }

    // ════════════════════════════════════════════════════════════════
    // Rate limit enforcement
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Rate limit enforcement")
    class RateLimitTests {

        @Test
        @DisplayName("con token -> request di qua binh thuong (status 200)")
        void withinLimit_requestPassesThrough() throws Exception {
            setTrustedProxies("");

            req.setRequestURI("/api/auth/register");
            req.setRemoteAddr("10.10.10.10");

            when(rateLimitConfig.getRegisterBucket("10.10.10.10")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(true);

            rateLimitFilter.doFilter(req, res, chain);

            assertThat(chain.getRequest()).isNotNull();
            assertThat(res.getStatus()).isEqualTo(200);
        }

        @Test
        @DisplayName("het token -> tra ve 429 Too Many Requests")
        void exceededLimit_returns429() throws Exception {
            setTrustedProxies("");

            req.setRequestURI("/api/auth/login");
            req.setRemoteAddr("20.20.20.20");

            when(rateLimitConfig.getLoginBucket("20.20.20.20")).thenReturn(bucket);
            when(bucket.tryConsume(1)).thenReturn(false);

            rateLimitFilter.doFilter(req, res, chain);

            assertThat(res.getStatus()).isEqualTo(429);
            assertThat(res.getContentType()).contains("application/json");
            assertThat(chain.getRequest()).isNull(); // filter chain bi dung lai
        }

        @Test
        @DisplayName("request den swagger-ui -> bo qua rate limit")
        void swaggerRequest_skipsRateLimit() throws Exception {
            setTrustedProxies("");

            req.setRequestURI("/swagger-ui/index.html");

            rateLimitFilter.doFilter(req, res, chain);

            verifyNoInteractions(rateLimitConfig);
            assertThat(chain.getRequest()).isNotNull();
        }

        @Test
        @DisplayName("request den /ws WebSocket -> bo qua rate limit")
        void websocketRequest_skipsRateLimit() throws Exception {
            setTrustedProxies("");

            req.setRequestURI("/ws/notifications");

            rateLimitFilter.doFilter(req, res, chain);

            verifyNoInteractions(rateLimitConfig);
            assertThat(chain.getRequest()).isNotNull();
        }
    }
}