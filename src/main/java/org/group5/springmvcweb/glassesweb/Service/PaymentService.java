package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.PaymentRequest;
import org.group5.springmvcweb.glassesweb.DTO.PaymentResponse;
import org.group5.springmvcweb.glassesweb.Entity.Order;
import org.group5.springmvcweb.glassesweb.Entity.Payment;
import org.group5.springmvcweb.glassesweb.Repository.OrderRepository;
import org.group5.springmvcweb.glassesweb.Repository.PaymentRepository;
import org.group5.springmvcweb.glassesweb.security.EyeProfileAccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PaymentService — mock payment.
 * Không tích hợp cổng thanh toán thật.
 * Gọi pay() → tạo Payment với status = PAID ngay lập tức.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    // =============================================
    // CUSTOMER: Thanh toán đơn hàng (mock)
    // =============================================
    @Transactional
    public PaymentResponse pay(Integer customerId, Integer orderId,
                               PaymentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Kiểm tra đơn thuộc về customer
        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new EyeProfileAccessDeniedException();
        }

        // Kiểm tra chưa thanh toán
        if (paymentRepository.findByOrder_OrderId(orderId).isPresent()) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán");
        }

        // Chỉ thanh toán khi PENDING
        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể thanh toán đơn hàng ở trạng thái PENDING");
        }

        // Mock: tạo transaction ref ngẫu nhiên → PAID ngay
        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getFinalAmount())
                .paymentMethod(request.getPaymentMethod())
                .status("PAID")
                .transactionRef("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .paidAt(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    // =============================================
    // CUSTOMER / STAFF: Xem thông tin thanh toán của đơn
    // =============================================
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Integer orderId) {
        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Chưa có thông tin thanh toán cho đơn hàng này"));
        return toResponse(payment);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getPaymentId())
                .orderId(p.getOrder().getOrderId())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus())
                .transactionRef(p.getTransactionRef())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}