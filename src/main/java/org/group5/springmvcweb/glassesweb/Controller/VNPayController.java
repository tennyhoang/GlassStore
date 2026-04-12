package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Service.VNPayService;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * VNPayController — xu ly thanh toan qua VNPay.
 *
 * POST /api/payment/vnpay/create?orderId=X
 *   → Tao URL thanh toan, tra ve cho frontend redirect
 *   → Yeu cau dang nhap (CUSTOMER)
 *
 * GET /api/payment/vnpay/callback
 *   → VNPay goi den sau khi customer thanh toan
 *   → Public (VNPay goi, khong co JWT)
 *   → Redirect browser ve frontend voi ket qua
 */
@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    private final VNPayService vnPayService;

    /**
     * Customer tao URL thanh toan VNPay.
     *
     * Request: POST /api/payment/vnpay/create?orderId=42
     * Response: { "data": { "paymentUrl": "https://sandbox.vnpayment.vn/..." } }
     *
     * Frontend nhan URL nay roi redirect window.location.href = paymentUrl
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPayment(
            @RequestParam Integer orderId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        String paymentUrl = vnPayService.createPaymentUrl(
                orderId,
                currentUser.getCustomerId(),
                clientIp
        );

        Map<String, String> data = new HashMap<>();
        data.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(ApiResponse.ok("Tao URL thanh toan thanh cong", data));
    }

    /**
     * Callback tu VNPay — goi sau khi customer thanh toan tren cong VNPay.
     *
     * VNPay redirect browser cua customer ve URL nay voi cac param:
     *   vnp_ResponseCode=00 (thanh cong) hoac khac (that bai/huy)
     *   vnp_TxnRef=orderId_timestamp
     *   vnp_SecureHash=... (chu ky de xac thuc)
     *
     * Backend xac thuc chu ky, cap nhat Payment + Order,
     * roi redirect browser ve frontend.
     *
     * PUBLIC — khong can JWT vi VNPay goi truc tiep.
     */
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(HttpServletRequest request) {
        // Lay tat ca query param tu request
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((k, v) -> {
            if (v != null && v.length > 0) {
                params.put(k, v[0]);
            }
        });

        String redirectUrl = vnPayService.handleCallback(params);

        // Redirect browser ve frontend
        return ResponseEntity.status(302)
                .location(URI.create(redirectUrl))
                .build();
    }

    /**
     * Lay IP thuc cua client (ho tro proxy/nginx).
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}