package org.group5.springmvcweb.glassesweb.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Swagger / OpenAPI 3.
 *
 * Sau khi chạy app, truy cập:
 *   http://localhost:8080/swagger-ui/index.html
 *
 * Cách test API có JWT:
 *   1. Gọi POST /api/auth/login → copy token
 *   2. Click "Authorize" → nhập: Bearer <token>
 *   3. Các API yêu cầu auth sẽ tự gửi header Authorization
 */
@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI glassStoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GlassStore API")
                        .description("""
                                REST API cho hệ thống cửa hàng kính mắt GlassStore.
                                
                                **Roles:**
                                - `CUSTOMER` — mua hàng, thiết kế kính, xem đơn hàng
                                - `STAFF` — quản lý đơn hàng, sản xuất
                                - `ADMIN` — quản lý toàn bộ hệ thống
                                - `OPERATION` — vận hành kho
                                - `SHIPPER` — giao hàng
                                
                                **Authentication:** JWT Bearer Token
                                1. Đăng nhập tại `POST /api/auth/login`
                                2. Copy token từ response
                                3. Click **Authorize** → nhập `Bearer <token>`
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Group 5 — FPT University HCM")
                                .email("ttuan0147@gmail.com")))
                // Thêm JWT auth scheme
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập JWT token (không cần thêm 'Bearer ')")));
    }
}
