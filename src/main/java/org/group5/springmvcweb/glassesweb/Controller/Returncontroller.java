package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class Returncontroller {

    private final ReturnRequestRepository returnRepository;
    private final OrderRepository         orderRepository;
    private final CustomerRepository      customerRepository;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReturnResponse>> create(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CreateReturnRequest req) {

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getCustomerId().equals(user.getCustomerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.fail("Bạn không có quyền yêu cầu đổi/trả đơn này"));
        }
        if (!"DELIVERED".equals(order.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Chỉ có thể đổi/trả đơn hàng đã giao"));
        }

        Customer customer = customerRepository.findById(user.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        ReturnRequest rr = new ReturnRequest();
        rr.setOrder(order);
        rr.setCustomer(customer);
        rr.setReason(req.getReason());
        rr.setReturnType(ReturnRequest.ReturnType.valueOf(req.getReturnType()));
        rr.setStatus(ReturnRequest.ReturnStatus.PENDING);
        rr.setCreatedAt(LocalDateTime.now());
        rr.setUpdatedAt(LocalDateTime.now());
        returnRepository.save(rr);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã gửi yêu cầu đổi/trả", toResponse(rr)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ReturnResponse>>> getMyReturns(
            @AuthenticationPrincipal UserPrincipal user) {
        List<ReturnResponse> list = returnRepository
                .findByCustomer_CustomerIdOrderByCreatedAtDesc(user.getCustomerId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<List<ReturnResponse>>> getAll(
            @RequestParam(required = false, defaultValue = "PENDING") String status) {
        ReturnRequest.ReturnStatus s = ReturnRequest.ReturnStatus.valueOf(status);
        List<ReturnResponse> list = returnRepository
                .findByStatusOrderByCreatedAtDesc(s)
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<ReturnResponse>> approve(
            @PathVariable Integer id,
            @RequestBody(required = false) StaffNoteRequest req) {
        return updateStatus(id, ReturnRequest.ReturnStatus.APPROVED,
                req != null ? req.getNote() : null);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<ReturnResponse>> reject(
            @PathVariable Integer id,
            @RequestBody(required = false) StaffNoteRequest req) {
        return updateStatus(id, ReturnRequest.ReturnStatus.REJECTED,
                req != null ? req.getNote() : null);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<ApiResponse<ReturnResponse>> complete(
            @PathVariable Integer id,
            @RequestBody(required = false) StaffNoteRequest req) {
        return updateStatus(id, ReturnRequest.ReturnStatus.COMPLETED,
                req != null ? req.getNote() : null);
    }

    private ResponseEntity<ApiResponse<ReturnResponse>> updateStatus(
            Integer id, ReturnRequest.ReturnStatus status, String note) {
        ReturnRequest rr = returnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));
        rr.setStatus(status);
        rr.setUpdatedAt(LocalDateTime.now());
        if (note != null && !note.isBlank()) rr.setStaffNote(note);
        returnRepository.save(rr);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật", toResponse(rr)));
    }

    private ReturnResponse toResponse(ReturnRequest rr) {
        return new ReturnResponse(
                rr.getReturnId(),
                rr.getOrder().getOrderId(),
                rr.getCustomer().getName(),
                rr.getReason(),
                rr.getReturnType() != null ? rr.getReturnType().name() : null,
                rr.getStatus()     != null ? rr.getStatus().name()     : null,
                rr.getStaffNote(),
                rr.getCreatedAt()
        );
    }

    @Getter @Setter @NoArgsConstructor
    public static class CreateReturnRequest {
        private Integer orderId;
        private String  reason;
        private String  returnType;
    }

    @Getter @Setter @NoArgsConstructor
    public static class StaffNoteRequest {
        private String note;
    }

    @Getter @AllArgsConstructor
    public static class ReturnResponse {
        private Integer       returnId;
        private Integer       orderId;
        private String        customerName;
        private String        reason;
        private String        returnType;
        private String        status;
        private String        staffNote;
        private LocalDateTime createdAt;
    }
}