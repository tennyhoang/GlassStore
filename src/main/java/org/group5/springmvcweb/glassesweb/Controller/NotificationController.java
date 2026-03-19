package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.Notification;
import org.group5.springmvcweb.glassesweb.Repository.NotificationRepository;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotifResponse>>> getAll(
            @AuthenticationPrincipal UserPrincipal user) {
        List<NotifResponse> list = notificationRepository
                .findByAccount_AccountIdOrderByCreatedAtDesc(user.getAccountId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal user) {
        long count = notificationRepository
                .countByAccount_AccountIdAndReadFalse(user.getAccountId());
        return ResponseEntity.ok(ApiResponse.ok(count));
    }

    @Transactional
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserPrincipal user) {
        notificationRepository.markAllReadByAccountId(user.getAccountId());
        return ResponseEntity.ok(ApiResponse.ok("Đã đọc tất cả thông báo", null));
    }

    @Transactional
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markOneRead(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer id) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getAccount().getAccountId().equals(user.getAccountId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
        return ResponseEntity.ok(ApiResponse.ok("Đã đọc", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer id) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getAccount().getAccountId().equals(user.getAccountId())) {
                notificationRepository.deleteById(id);
            }
        });
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá thông báo", null));
    }

    private NotifResponse toResponse(Notification n) {
        return new NotifResponse(
                n.getNotificationId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),          // String — không dùng .name()
                n.getReferenceId(),   // đúng tên field referenceId
                n.isRead(),
                n.getCreatedAt()
        );
    }

    @Getter @AllArgsConstructor
    public static class NotifResponse {
        private Integer       notificationId;
        private String        title;
        private String        message;
        private String        type;          // String
        private Integer       referenceId;   // đúng tên
        private boolean       read;
        private LocalDateTime createdAt;
    }
}