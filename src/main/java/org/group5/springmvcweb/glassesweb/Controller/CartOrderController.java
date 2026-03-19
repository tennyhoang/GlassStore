package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.CartService;
import org.group5.springmvcweb.glassesweb.Service.OrderService;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CartController + OrderController
 *
 * ── CART (/api/cart) ─────────────────────────────────
 * GET    /api/cart                 → Xem giỏ hàng (CUSTOMER)
 * POST   /api/cart/items           → Thêm vào giỏ (CUSTOMER)
 * DELETE /api/cart/items/{itemId}  → Xoá khỏi giỏ (CUSTOMER)
 *
 * ── ORDER (/api/orders) ──────────────────────────────
 * POST   /api/orders               → Đặt hàng từ giỏ (CUSTOMER)
 * GET    /api/orders/me            → Lịch sử đơn hàng (CUSTOMER)
 * GET    /api/orders/{id}          → Chi tiết đơn (CUSTOMER)
 *
 * GET    /api/orders/manage        → Xem đơn theo status (STAFF/ADMIN)
 * PATCH  /api/orders/{id}/status   → Cập nhật status (STAFF/ADMIN)
 * PATCH  /api/orders/{id}/cancel   → Huỷ đơn (STAFF/ADMIN)
 */
@RestController
@RequiredArgsConstructor
public class CartOrderController {

    private final CartService cartService;
    private final OrderService orderService;

    // ══════════════════════════════════════════
    // CART
    // ══════════════════════════════════════════

    @GetMapping("/api/cart")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                cartService.getOrCreateCart(currentUser.getCustomerId())));
    }

    @PostMapping("/api/cart/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã thêm vào giỏ hàng",
                        cartService.addToCart(currentUser.getCustomerId(), request)));
    }

    @DeleteMapping("/api/cart/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer itemId) {
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá khỏi giỏ hàng",
                cartService.removeFromCart(currentUser.getCustomerId(), itemId)));
    }

    // ══════════════════════════════════════════
    // ORDER — CUSTOMER
    // ══════════════════════════════════════════

    @PostMapping("/api/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody PlaceOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt hàng thành công",
                        orderService.placeOrder(currentUser.getCustomerId(), request)));
    }

    @GetMapping("/api/orders/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                orderService.getMyOrders(currentUser.getCustomerId())));
    }

    @GetMapping("/api/orders/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(
                orderService.getOrderDetail(currentUser.getCustomerId(), id)));
    }

    // ══════════════════════════════════════════
    // ORDER — STAFF / ADMIN
    // ══════════════════════════════════════════

    @GetMapping("/api/orders/manage")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByStatus(
            @RequestParam(defaultValue = "PENDING") String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                orderService.getOrdersByStatus(status)));
    }

    @PatchMapping("/api/orders/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công",
                orderService.updateOrderStatus(id, request)));
    }

    @PatchMapping("/api/orders/{id}/cancel")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Đã huỷ đơn hàng",
                orderService.cancelOrder(id)));
    }
}