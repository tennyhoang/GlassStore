# GlassStore Backend — Refactored Files (Giai đoạn 1)

## Cấu trúc thư mục

```
├── pom.xml                                          ← UPDATED: thêm springdoc + security-test
└── src/
    ├── main/java/.../
    │   ├── config/
    │   │   └── SwaggerConfig.java                   ← MỚI: cấu hình Swagger UI
    │   └── security/
    │       └── GlobalExceptionHandler.java           ← UPDATED: mở rộng xử lý exception
    └── test/java/.../
        ├── AuthServiceTest.java                      ← MỚI: 4 unit test cho AuthService
        └── ProductServiceTest.java                   ← MỚI: 6 unit test cho ProductService
```

---

## Cách apply

### Bước 1 — Copy file vào project
```
pom.xml                    → thay file cũ
src/main/.../config/SwaggerConfig.java           → tạo mới
src/main/.../security/GlobalExceptionHandler.java → thay file cũ
src/test/.../AuthServiceTest.java                → tạo mới
src/test/.../ProductServiceTest.java             → tạo mới
```

### Bước 2 — Reload Maven
```bash
mvn clean install
# hoặc trong IntelliJ: chuột phải pom.xml → Maven → Reload Project
```

### Bước 3 — Chạy test
```bash
mvn test
# Chạy test cụ thể:
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=ProductServiceTest
```

### Bước 4 — Xem Swagger UI
Khởi động app rồi truy cập:
```
http://localhost:8080/swagger-ui/index.html
```

---

## Chi tiết từng thay đổi

### 1. `pom.xml` — Thêm 2 dependency

```xml
<!-- Swagger / OpenAPI 3 -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>

<!-- Spring Security Test — dùng @WithMockUser trong test -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

### 2. `SwaggerConfig.java` — Tạo mới

Cấu hình Swagger UI với JWT Bearer auth:
- Truy cập `/swagger-ui/index.html`
- Click **Authorize** → nhập token
- Test API trực tiếp trên browser

SecurityConfig đã có sẵn `permitAll()` cho `/swagger-ui/**` và `/v3/api-docs/**` rồi — không cần sửa thêm.

### 3. `GlobalExceptionHandler.java` — Mở rộng

| Exception | HTTP Status | Trường hợp |
|-----------|-------------|------------|
| `MethodArgumentNotValidException` | 400 | @Valid thất bại → trả về map field:message |
| `MissingServletRequestParameterException` | 400 | Thiếu query param bắt buộc |
| `MethodArgumentTypeMismatchException` | 400 | Sai kiểu tham số (VD: "abc" thay vì số) |
| `MaxUploadSizeExceededException` | 400 | File upload quá lớn |
| `BadCredentialsException` | 401 | Sai username/password |
| `DisabledException` | 401 | Tài khoản bị vô hiệu hoá |
| `LockedException` | 401 | Tài khoản bị khoá |
| `AccessDeniedException` | 403 | @PreAuthorize thất bại |
| `EyeProfileNotFoundException` | 404 | Custom exception |
| `EyeProfileAccessDeniedException` | 403 | Custom exception |
| `RuntimeException` | 400 | Lỗi nghiệp vụ (message từ Service) |
| `Exception` | 500 | Lỗi hệ thống — log + trả về message chung |

**Lý do tách `Exception` khỏi `RuntimeException`:** RuntimeException là lỗi nghiệp vụ có thể đoán trước (trả về message thật cho user). Exception là lỗi hệ thống không mong muốn (log đầy đủ, trả về message chung để không lộ thông tin nhạy cảm).

### 4. Unit Tests — Mockito pattern

Cả 2 test file dùng cùng pattern:
```java
@ExtendWith(MockitoExtension.class)  // không cần Spring context → test nhanh hơn
class AuthServiceTest {
    @Mock private AccountRepository accountRepository;  // mock dependency
    @InjectMocks private AuthService authService;       // inject mock vào
    
    @Test
    void login_success_returnsAuthResponse() {
        // Arrange — setup mock behavior
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        
        // Act — gọi method cần test
        AuthResponse response = authService.login(request);
        
        // Assert — kiểm tra kết quả
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        
        // Verify — kiểm tra mock được gọi đúng số lần
        verify(jwtUtil, times(1)).generateToken(any());
    }
}
```

**Tại sao dùng `@ExtendWith(MockitoExtension.class)` thay vì `@SpringBootTest`?**
- `@SpringBootTest` load toàn bộ Spring context + kết nối DB → chậm (5-10 giây)
- `MockitoExtension` chỉ test logic thuần Java → nhanh (< 1 giây)
- Unit test nên test 1 class, không cần cả hệ thống

---

## Điểm có thể hỏi trong phỏng vấn

**Q: Tại sao dùng `@RestControllerAdvice` thay vì try-catch trong từng controller?**
> A: Tách biệt error handling khỏi business logic. Controller chỉ lo happy path, exception tự động được bắt tập trung. Tránh duplicate code và đảm bảo response format nhất quán.

**Q: `@ExceptionHandler(RuntimeException.class)` có bắt được `BadCredentialsException` không?**
> A: Không, vì Spring ưu tiên handler cụ thể nhất. `BadCredentialsException` match với `handleBadCredentials()` trước, không fall qua `handleRuntime()`.

**Q: Tại sao không trả về message thật của Exception trong handler 500?**
> A: Message có thể chứa thông tin nhạy cảm như SQL query, file path, stack trace. Chỉ log server-side, trả về message chung cho client.
