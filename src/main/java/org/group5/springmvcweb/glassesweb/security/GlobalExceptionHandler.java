package org.group5.springmvcweb.glassesweb.security;

import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

/**
 * Xử lý tập trung tất cả exception trong ứng dụng.
 * Mọi exception đều trả về cùng cấu trúc ApiResponse để frontend dễ xử lý.
 *
 * Thứ tự ưu tiên: exception cụ thể → RuntimeException → Exception
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ─── 400 Bad Request ─────────────────────────────────────────────────────

    /**
     * Lỗi @Valid — trả về map field → message để frontend hiện lỗi từng field.
     * VD: { "username": "Username không được để trống", "email": "Email không hợp lệ" }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field   = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Dữ liệu không hợp lệ")
                        .data(errors)
                        .build());
    }

    /**
     * Thiếu request parameter bắt buộc.
     * VD: GET /api/orders/manage — quên truyền ?status=
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(
            MissingServletRequestParameterException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("Thiếu tham số bắt buộc: " + ex.getParameterName()));
    }

    /**
     * Sai kiểu tham số — VD: truyền "abc" vào field cần Integer.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        String msg = String.format("Tham số '%s' không hợp lệ: '%s'",
                ex.getName(), ex.getValue());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(msg));
    }

    /**
     * File upload vượt quá kích thước cho phép (spring.servlet.multipart.max-file-size).
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail("File quá lớn. Vui lòng upload file nhỏ hơn 10MB"));
    }

    // ─── 401 Unauthorized ────────────────────────────────────────────────────

    /**
     * Sai username hoặc password.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail("Username hoặc mật khẩu không đúng"));
    }

    /**
     * Tài khoản bị vô hiệu hoá.
     */
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabled(DisabledException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail("Tài khoản đã bị vô hiệu hoá"));
    }

    /**
     * Tài khoản bị khoá.
     */
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiResponse<Void>> handleLocked(LockedException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail("Tài khoản đã bị khoá"));
    }

    // ─── 403 Forbidden ───────────────────────────────────────────────────────

    /**
     * Không có quyền truy cập — Spring Security ném khi @PreAuthorize thất bại.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.fail("Bạn không có quyền thực hiện thao tác này"));
    }

    /**
     * Không tìm thấy hồ sơ mắt (custom exception của project).
     */
    @ExceptionHandler(EyeProfileNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEyeProfileNotFound(EyeProfileNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.fail(ex.getMessage()));
    }

    /**
     * Không có quyền truy cập hồ sơ mắt (custom exception của project).
     */
    @ExceptionHandler(EyeProfileAccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleEyeProfileAccessDenied(EyeProfileAccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.fail(ex.getMessage()));
    }

    // ─── 400 Business Logic (RuntimeException) ───────────────────────────────

    /**
     * Lỗi nghiệp vụ chung — tất cả RuntimeException trong Service đều được bắt ở đây.
     * VD: "Giỏ hàng trống", "Mã giảm giá hết hạn", "Username đã tồn tại"...
     *
     * Không log ở INFO vì đây là lỗi nghiệp vụ bình thường, không phải lỗi hệ thống.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(ex.getMessage()));
    }

    // ─── 500 Internal Server Error ───────────────────────────────────────────

    /**
     * Lỗi hệ thống không mong muốn — log đầy đủ để debug, trả về message chung cho client.
     * Không expose exception message vì có thể chứa thông tin nhạy cảm (SQL, path...).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau"));
    }
}
