package org.group5.springmvcweb.glassesweb.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.security.EyeProfileAccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final DiscountRepository discountRepository;
    private final GlassesDesignRepository glassesDesignRepository;
    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;
    private final GlassesDesignService glassesDesignService;
    private final ObjectMapper objectMapper;

    // =============================================
    // CUSTOMER: Đặt hàng từ giỏ hàng
    // =============================================
    @Transactional
    public OrderResponse placeOrder(Integer customerId, PlaceOrderRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        // Lấy giỏ hàng
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống"));
        List<CartItem> cartItems = cartItemRepository.findByCart_CartId(cart.getCartId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, vui lòng thêm sản phẩm trước");
        }

        // Tính tổng tiền
        BigDecimal totalAmount = cartItems.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Xử lý mã giảm giá
        BigDecimal discountAmount = BigDecimal.ZERO;
        Discount discount = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            discount = discountRepository
                    .findByCodeAndStatus(request.getDiscountCode(), "ACTIVE")
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

            // Kiểm tra hết hạn
            if (discount.getExpiresAt() != null &&
                    discount.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã giảm giá đã hết hạn");
            }
            // Kiểm tra đơn tối thiểu
            if (discount.getMinOrderValue() != null &&
                    totalAmount.compareTo(discount.getMinOrderValue()) < 0) {
                throw new RuntimeException(
                        "Đơn hàng tối thiểu " + discount.getMinOrderValue() + " để dùng mã này");
            }
            // Kiểm tra giới hạn sử dụng
            if (discount.getUsageLimit() != null &&
                    discount.getUsedCount() >= discount.getUsageLimit()) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
            }

            if ("PERCENTAGE".equals(discount.getDiscountType())) {
                discountAmount = totalAmount.multiply(discount.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
            } else {
                discountAmount = discount.getDiscountValue();
            }
            // Không giảm quá tổng tiền
            if (discountAmount.compareTo(totalAmount) > 0) {
                discountAmount = totalAmount;
            }

            // Tăng usedCount
            discount.setUsedCount(discount.getUsedCount() + 1);
            discountRepository.save(discount);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Tạo Order
        Order order = Order.builder()
                .customer(customer)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .discount(discount)
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .status("PENDING")
                .build();
        order = orderRepository.save(order);

        // Tạo OrderItems từ CartItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            String itemType = ci.getDesignId() != null ? "CUSTOM_GLASSES" : "READY_MADE";
            BigDecimal subtotal = ci.getUnitPrice()
                    .multiply(BigDecimal.valueOf(ci.getQuantity()));

            // Tạo snapshot JSON
            String snapshot = buildSnapshot(ci);

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .itemType(itemType)
                    .designId(ci.getDesignId())
                    .readyMadeGlassesId(ci.getReadyMadeGlassesId())
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .subtotal(subtotal)
                    .productSnapshot(snapshot)
                    .build();
            orderItems.add(orderItemRepository.save(oi));

            // Đánh dấu design là ORDERED
            if (ci.getDesignId() != null) {
                glassesDesignService.markDesignAsOrdered(ci.getDesignId());
            }
        }

        // Xoá giỏ hàng sau khi đặt
        cartItemRepository.deleteByCart_CartId(cart.getCartId());

        return toOrderResponse(order, orderItems);
    }

    // =============================================
    // CUSTOMER: Xem lịch sử đơn hàng
    // =============================================
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Integer customerId) {
        return orderRepository.findByCustomer_CustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(o -> toOrderResponse(o,
                        orderItemRepository.findByOrder_OrderId(o.getOrderId())))
                .collect(Collectors.toList());
    }

    // =============================================
    // CUSTOMER: Xem chi tiết 1 đơn hàng
    // =============================================
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(Integer customerId, Integer orderId) {
        if (!orderRepository.existsByOrderIdAndCustomer_CustomerId(orderId, customerId)) {
            throw new EyeProfileAccessDeniedException();
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return toOrderResponse(order,
                orderItemRepository.findByOrder_OrderId(orderId));
    }

    // =============================================
    // STAFF/ADMIN: Xem tất cả đơn hàng theo status
    // =============================================
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(String status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(o -> toOrderResponse(o,
                        orderItemRepository.findByOrder_OrderId(o.getOrderId())))
                .collect(Collectors.toList());
    }

    // =============================================
    // STAFF/ADMIN: Cập nhật status đơn hàng
    // Luồng: PENDING → CONFIRMED → MANUFACTURING → SHIPPING → DELIVERED
    // =============================================
    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId,
                                           UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        validateStatusTransition(order.getStatus(), request.getStatus());
        order.setStatus(request.getStatus());
        orderRepository.save(order);

        // Khi DELIVERED → tạo MyGlasses cho từng design item
        if ("DELIVERED".equals(request.getStatus())) {
            List<OrderItem> items = orderItemRepository.findByOrder_OrderId(orderId);
            for (OrderItem item : items) {
                if ("CUSTOM_GLASSES".equals(item.getItemType()) && item.getDesignId() != null) {
                    glassesDesignService.createMyGlasses(
                            order.getCustomer().getCustomerId(),
                            item.getDesignId(),
                            orderId
                    );
                }
            }
        }

        return toOrderResponse(order, orderItemRepository.findByOrder_OrderId(orderId));
    }

    // =============================================
    // STAFF/ADMIN: Huỷ đơn hàng
    // =============================================
    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!List.of("PENDING", "CONFIRMED").contains(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể huỷ đơn ở trạng thái PENDING hoặc CONFIRMED");
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return toOrderResponse(order, orderItemRepository.findByOrder_OrderId(orderId));
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private void validateStatusTransition(String current, String next) {
        List<String> validNextStatuses = switch (current) {
            case "PENDING"       -> List.of("CONFIRMED", "CANCELLED");
            case "CONFIRMED"     -> List.of("MANUFACTURING", "CANCELLED");
            case "MANUFACTURING" -> List.of("SHIPPING");
            case "SHIPPING"      -> List.of("DELIVERED");
            default -> List.of();
        };
        if (!validNextStatuses.contains(next)) {
            throw new RuntimeException(
                    "Không thể chuyển từ " + current + " sang " + next);
        }
    }

    private String buildSnapshot(CartItem ci) {
        try {
            if (ci.getDesignId() != null) {
                GlassesDesign d = glassesDesignRepository.findById(ci.getDesignId())
                        .orElse(null);
                if (d == null) return "{}";
                var map = new java.util.HashMap<String, Object>();
                map.put("type", "CUSTOM_GLASSES");
                map.put("designId", d.getDesignId());
                map.put("designName", d.getDesignName());
                map.put("frameName", d.getFrame().getName());
                map.put("lensName", d.getLens().getName());
                map.put("totalPrice", d.getTotalPrice());
                return objectMapper.writeValueAsString(map);
            } else {
                ReadyMadeGlasses r = readyMadeGlassesRepository
                        .findById(ci.getReadyMadeGlassesId()).orElse(null);
                if (r == null) return "{}";
                var map = new java.util.HashMap<String, Object>();
                map.put("type", "READY_MADE");
                map.put("productId", r.getProductId());
                map.put("name", r.getName());
                map.put("brand", r.getBrand());
                map.put("price", r.getPrice());
                return objectMapper.writeValueAsString(map);
            }
        } catch (Exception e) {
            return "{}";
        }
    }

    private OrderResponse toOrderResponse(Order o, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(i -> OrderItemResponse.builder()
                        .orderItemId(i.getOrderItemId())
                        .itemType(i.getItemType())
                        .designId(i.getDesignId())
                        .readyMadeGlassesId(i.getReadyMadeGlassesId())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .productSnapshot(i.getProductSnapshot())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(o.getOrderId())
                .customerId(o.getCustomer().getCustomerId())
                .customerName(o.getCustomer().getName())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .discountAmount(o.getDiscountAmount())
                .finalAmount(o.getFinalAmount())
                .discountCode(o.getDiscount() != null ? o.getDiscount().getCode() : null)
                .shippingAddress(o.getShippingAddress())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}