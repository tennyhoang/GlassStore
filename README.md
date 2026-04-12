# GlassStore — Backend

REST API cho hệ thống bán kính mắt cao cấp GlassStore, xây dựng bằng Spring Boot 3.2.2.

## Tech Stack

- **Java 17** + **Spring Boot 3.2.2**
- **SQL Server** (database)
- **Spring Security** + **JWT** (xác thực)
- **Hibernate / JPA** (ORM)
- **Cloudinary** (lưu trữ ảnh)
- **WebSocket / STOMP** (thông báo realtime)
- **Bucket4j** (rate limiting)
- **Swagger / OpenAPI** (API docs)

## Yêu cầu hệ thống

- Java 17+
- Maven 3.8+
- SQL Server 2019+ (hoặc SQL Server Express)
- (Tuỳ chọn) Gmail App Password nếu muốn gửi email

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/tennyhoang/GlassStore.git
cd GlassStore
git checkout main
```

### 2. Tạo database

Mở **SQL Server Management Studio**, chạy script tạo database:

```sql
CREATE DATABASE GlassStore;
USE GlassStore;
-- Chạy file schema.sql trong thư mục /sql (nếu có)
```

Sau đó chạy migration thêm cột:

```sql
USE GlassStore;
ALTER TABLE cart_item ADD frame_id INT NULL;
```

### 3. Cấu hình `application.properties`

Mở file `src/main/resources/application.properties` và điền thông tin:

```properties
# Database
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=GlassStore;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD

# JWT — giữ nguyên hoặc đổi secret
jwt.secret=GlassDB_SuperSecretKey_2024_Group5_ABCDEF
jwt.expiration-ms=86400000

# Email (tuỳ chọn — tắt khi dev)
app.mail.enabled=false
# Nếu muốn bật: điền Gmail + App Password (16 ký tự)
# spring.mail.username=your-gmail@gmail.com
# spring.mail.password=your-app-password

# VNPay (tuỳ chọn — cần tài khoản sandbox VNPay)
vnpay.tmn-code=YOUR_TMN_CODE
vnpay.hash-secret=YOUR_HASH_SECRET
```

### 4. Chạy ứng dụng

```bash
mvn spring-boot:run
```

Hoặc build JAR:

```bash
mvn clean package -DskipTests
java -jar target/glassesweb-*.jar
```

Backend sẽ chạy tại: `http://localhost:8080`

## API Documentation

Truy cập Swagger UI sau khi chạy:

```
http://localhost:8080/swagger-ui/index.html
```

## Các tính năng chính

| Tính năng | Endpoint |
|-----------|----------|
| Xác thực (Login/Register/Refresh) | `/api/auth/**` |
| Quản lý sản phẩm (Gọng/Tròng/Kính làm sẵn) | `/api/frames/**`, `/api/lenses/**` |
| Thiết kế kính theo yêu cầu | `/api/glasses-designs/**` |
| Giỏ hàng | `/api/cart/**` |
| Đặt hàng & theo dõi | `/api/orders/**` |
| Hồ sơ mắt | `/api/eye-profiles/**` |
| Thông báo realtime | WebSocket `/ws` |
| Thanh toán VNPay | `/api/payment/vnpay/**` |
| Đánh giá sản phẩm | `/api/reviews/**` |
| Mã giảm giá | `/api/discounts/**` |
| Quản lý sản xuất | `/api/manufacturing/**` |
| Quản lý giao hàng | `/api/shipments/**` |
| Đặt trước (Pre-order) | `/api/pre-orders/**` |

## Phân quyền

| Role | Quyền |
|------|-------|
| `CUSTOMER` | Mua hàng, xem đơn, đánh giá, quản lý hồ sơ mắt |
| `STAFF` | Quản lý đơn hàng, sản xuất, giao hàng |
| `ADMIN` | Toàn quyền + quản lý người dùng, sản phẩm |
| `SHIPPER` | Cập nhật trạng thái giao hàng |

## Tài khoản mặc định (dev)

```
admin   / (password trong DB)  → ADMIN
staff01 / (password trong DB)  → STAFF
tenny   / (password trong DB)  → CUSTOMER
```

## Cấu trúc thư mục

```
src/main/java/org/group5/springmvcweb/glassesweb/
├── Controller/     # REST endpoints
├── Service/        # Business logic
├── Repository/     # JPA repositories
├── Entity/         # Database entities
├── DTO/            # Request/Response objects
├── security/       # JWT, Spring Security config
└── config/         # App configuration (Cache, WebSocket, RateLimit...)
```

## Nhóm phát triển

**Group 5 — FPT University**
