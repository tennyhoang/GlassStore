package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.group5.springmvcweb.glassesweb.DTO.OrderResponse;
import org.group5.springmvcweb.glassesweb.Entity.Order;
import org.group5.springmvcweb.glassesweb.Entity.Payment;
import org.group5.springmvcweb.glassesweb.Repository.OrderItemRepository;
import org.group5.springmvcweb.glassesweb.Repository.OrderRepository;
import org.group5.springmvcweb.glassesweb.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

/**
 * VNPayService — tich hop thanh toan VNPay.
 *
 * Flow:
 *   1. Customer chon "Thanh toan VNPay" tren CheckoutPage
 *   2. Frontend goi POST /api/payment/vnpay/create?orderId=X
 *   3. Backend tao URL thanh toan co chu ky HMAC-SHA512
 *   4. Frontend redirect browser den URL VNPay
 *   5. Customer nhap OTP tren cong VNPay
 *   6. VNPay goi GET /api/payment/vnpay/callback?vnp_ResponseCode=00&...
 *   7. Backend xac thuc chu ky, cap nhat Payment + Order
 *   8. GUI EMAIL xac nhan thanh toan → redirect ve frontend
 *
 * Dang ky sandbox: https://sandbox.vnpayment.vn/devreg/
 * The test: 9704198526191432198  OTP: 123456
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final OrderRepository    orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository  paymentRepository;
    private final EmailService       emailService;   // GUI EMAIL sau thanh toan

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.payment-url}")
    private String paymentUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.frontend-url}")
    private String frontendUrl;

    // =========================================================
    // TAO URL THANH TOAN
    // =========================================================

    @Transactional
    public String createPaymentUrl(Integer orderId, Integer customerId, String clientIp) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));

        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Ban khong co quyen thanh toan don hang nay");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Don hang khong o trang thai cho thanh toan");
        }

        paymentRepository.findByOrder_OrderId(orderId).ifPresent(p -> {
            if ("PAID".equals(p.getStatus())) {
                throw new RuntimeException("Don hang nay da duoc thanh toan");
            }
        });

        // Tao / cap nhat Payment PENDING
        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElse(Payment.builder()
                        .order(order)
                        .amount(order.getFinalAmount())
                        .paymentMethod("VNPAY")
                        .status("PENDING")
                        .build());
        payment.setPaymentMethod("VNPAY");
        payment.setStatus("PENDING");
        paymentRepository.save(payment);

        // Build params
        String vnpTxnRef    = orderId + "_" + System.currentTimeMillis();
        String vnpAmount    = String.valueOf(order.getFinalAmount()
                .multiply(java.math.BigDecimal.valueOf(100)).longValue());
        String vnpOrderInfo = "Thanh toan don hang GlassStore #" + orderId;
        String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String vnpExpireDate = new SimpleDateFormat("yyyyMMddHHmmss")
                .format(new Date(System.currentTimeMillis() + 15 * 60 * 1000));

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version",    "2.1.0");
        params.put("vnp_Command",    "pay");
        params.put("vnp_TmnCode",    tmnCode);
        params.put("vnp_Amount",     vnpAmount);
        params.put("vnp_CurrCode",   "VND");
        params.put("vnp_TxnRef",     vnpTxnRef);
        params.put("vnp_OrderInfo",  vnpOrderInfo);
        params.put("vnp_OrderType",  "other");
        params.put("vnp_Locale",     "vn");
        params.put("vnp_ReturnUrl",  returnUrl);
        params.put("vnp_IpAddr",     clientIp != null ? clientIp : "127.0.0.1");
        params.put("vnp_CreateDate", vnpCreateDate);
        params.put("vnp_ExpireDate", vnpExpireDate);

        String queryString = buildQueryString(params);
        String secureHash  = hmacSha512(hashSecret, queryString);

        payment.setTransactionRef(vnpTxnRef);
        paymentRepository.save(payment);

        return paymentUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    // =========================================================
    // XU LY CALLBACK TU VNPAY
    // =========================================================

    @Transactional
    public String handleCallback(Map<String, String> params) {
        String receivedHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        Map<String, String> vnpParams = new TreeMap<>();
        params.forEach((k, v) -> { if (k.startsWith("vnp_")) vnpParams.put(k, v); });

        String queryString    = buildQueryString(vnpParams);
        String expectedHash   = hmacSha512(hashSecret, queryString);
        boolean signatureValid = expectedHash.equalsIgnoreCase(receivedHash);

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef       = params.get("vnp_TxnRef");

        log.info("VNPay callback: txnRef={}, responseCode={}, signatureValid={}",
                txnRef, responseCode, signatureValid);

        if (!signatureValid) {
            log.warn("VNPay callback chu ky khong hop le! txnRef={}", txnRef);
            return frontendUrl + "/payment/result?status=INVALID_SIGNATURE";
        }

        Integer orderId = extractOrderId(txnRef);
        if (orderId == null) {
            return frontendUrl + "/payment/result?status=ERROR&message=Invalid+txnRef";
        }

        Payment payment = paymentRepository.findByOrder_OrderId(orderId).orElse(null);
        if (payment == null) {
            return frontendUrl + "/payment/result?status=ERROR&orderId=" + orderId;
        }

        if ("00".equals(responseCode)) {
            // Thanh toan thanh cong
            payment.setStatus("PAID");
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if ("PENDING".equals(order.getStatus())) {
                order.setStatus("CONFIRMED");
                orderRepository.save(order);
            }

            // GUI EMAIL xac nhan thanh toan (async)
            try {
                List<org.group5.springmvcweb.glassesweb.Entity.OrderItem> items =
                        orderItemRepository.findByOrder_OrderId(orderId);
                // Build OrderResponse don gian de truyen cho EmailService
                OrderResponse orderResp = buildSimpleOrderResponse(order, items);
                emailService.sendPaymentSuccess(
                        orderResp,
                        order.getCustomer().getEmail(),
                        payment.getTransactionRef()
                );
            } catch (Exception e) {
                log.warn("Khong gui duoc email xac nhan thanh toan: {}", e.getMessage());
            }

            log.info("VNPay: don hang #{} thanh toan thanh cong", orderId);
            return frontendUrl + "/payment/result?status=SUCCESS&orderId=" + orderId;

        } else {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            log.info("VNPay: don hang #{} that bai, code={}", orderId, responseCode);
            return frontendUrl + "/payment/result?status=FAILED&orderId=" + orderId
                    + "&code=" + responseCode;
        }
    }

    // =========================================================
    // PRIVATE HELPERS
    // =========================================================

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        params.forEach((k, v) -> {
            if (v != null && !v.isBlank()) {
                if (sb.length() > 0) sb.append('&');
                sb.append(URLEncoder.encode(k, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
            }
        });
        return sb.toString();
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Loi tinh HMAC-SHA512", e);
        }
    }

    private Integer extractOrderId(String txnRef) {
        if (txnRef == null) return null;
        try { return Integer.parseInt(txnRef.split("_")[0]); }
        catch (Exception e) { return null; }
    }

    /**
     * Build OrderResponse toi gian de truyen cho EmailService.
     * Khong can day du thong tin — chi can du de render email.
     */
    private OrderResponse buildSimpleOrderResponse(
            Order order,
            List<org.group5.springmvcweb.glassesweb.Entity.OrderItem> items) {

        var itemResponses = items.stream().map(i ->
                org.group5.springmvcweb.glassesweb.DTO.OrderItemResponse.builder()
                        .orderItemId(i.getOrderItemId())
                        .itemType(i.getItemType())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build()
        ).toList();

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .customerName(order.getCustomer().getName())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .discountCode(order.getDiscount() != null ? order.getDiscount().getCode() : null)
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}