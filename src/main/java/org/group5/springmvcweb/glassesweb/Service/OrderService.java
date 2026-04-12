package org.group5.springmvcweb.glassesweb.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.group5.springmvcweb.glassesweb.security.EyeProfileAccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository            orderRepository;
    private final OrderItemRepository        orderItemRepository;
    private final CartRepository             cartRepository;
    private final CartItemRepository         cartItemRepository;
    private final CustomerRepository         customerRepository;
    private final DiscountRepository         discountRepository;
    private final GlassesDesignRepository    glassesDesignRepository;
    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;
    private final FrameRepository            frameRepository;
    private final ShipmentRepository         shipmentRepository;
    private final GlassesDesignService       glassesDesignService;
    private final ObjectMapper               objectMapper;
    private final EmailService               emailService;   // GUI EMAIL

    // =============================================
    // CUSTOMER: Dat hang tu gio hang
    // =============================================
    @Transactional
    public OrderResponse placeOrder(Integer customerId, PlaceOrderRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay khach hang"));

        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Gio hang trong"));
        List<CartItem> cartItems = cartItemRepository.findByCart_CartId(cart.getCartId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Gio hang trong, vui long them san pham truoc");
        }

        // Tinh tong tien
        BigDecimal totalAmount = cartItems.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Xu ly ma giam gia
        BigDecimal discountAmount = BigDecimal.ZERO;
        Discount discount = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            discount = discountRepository
                    .findByCodeAndStatus(request.getDiscountCode(), "ACTIVE")
                    .orElseThrow(() -> new RuntimeException("Ma giam gia khong hop le hoac da het han"));

            if (discount.getExpiresAt() != null &&
                    discount.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Ma giam gia da het han");
            }
            if (discount.getMinOrderValue() != null &&
                    totalAmount.compareTo(discount.getMinOrderValue()) < 0) {
                throw new RuntimeException(
                        "Don hang toi thieu " + discount.getMinOrderValue() + " de dung ma nay");
            }
            if (discount.getUsageLimit() != null &&
                    discount.getUsedCount() >= discount.getUsageLimit()) {
                throw new RuntimeException("Ma giam gia da het luot su dung");
            }

            if ("PERCENTAGE".equals(discount.getDiscountType())) {
                discountAmount = totalAmount.multiply(discount.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
            } else {
                discountAmount = discount.getDiscountValue();
            }
            if (discountAmount.compareTo(totalAmount) > 0) {
                discountAmount = totalAmount;
            }

            discount.setUsedCount(discount.getUsedCount() + 1);
            discountRepository.save(discount);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Tao Order
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

        // Tao OrderItems tu CartItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            String itemType;
            if (ci.getDesignId() != null) {
                itemType = "CUSTOM_GLASSES";
            } else if (ci.getFrameId() != null) {
                itemType = "FRAME_ONLY";
            } else {
                itemType = "READY_MADE";
            }
            BigDecimal subtotal = ci.getUnitPrice()
                    .multiply(BigDecimal.valueOf(ci.getQuantity()));
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

            if (ci.getDesignId() != null) {
                glassesDesignService.markDesignAsOrdered(ci.getDesignId());
            }
        }

        // Xoa gio hang sau khi dat
        cartItemRepository.deleteByCart_CartId(cart.getCartId());

        OrderResponse response = toOrderResponse(order, orderItems);

        // GUI EMAIL xac nhan dat hang (async — khong lam cham response)
        emailService.sendOrderConfirmation(response, customer.getEmail());

        return response;
    }

    // =============================================
    // CUSTOMER: Xem lich su don hang
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
    // CUSTOMER: Xem chi tiet 1 don hang
    // =============================================
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(Integer customerId, Integer orderId) {
        if (!orderRepository.existsByOrderIdAndCustomer_CustomerId(orderId, customerId)) {
            throw new EyeProfileAccessDeniedException();
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));
        return toOrderResponse(order, orderItemRepository.findByOrder_OrderId(orderId));
    }

    // =============================================
    // STAFF/ADMIN: Xem tat ca don hang theo status
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
    // STAFF/ADMIN: Search + filter + sort don hang
    // =============================================
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> searchOrders(OrderSearchRequest req) {
        Set<String> allowedSort = Set.of("orderId", "createdAt", "finalAmount", "status");
        String sortBy = allowedSort.contains(req.getSortBy()) ? req.getSortBy() : "createdAt";

        Sort.Direction dir = "asc".equalsIgnoreCase(req.getSortDir())
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                Math.max(req.getPage(), 0),
                Math.min(Math.max(req.getSize(), 1), 100),
                Sort.by(dir, sortBy)
        );

        String keyword = (req.getKeyword() == null || req.getKeyword().isBlank())
                ? null : req.getKeyword().trim();
        String status  = (req.getStatus()  == null || req.getStatus().isBlank())
                ? null : req.getStatus().trim();

        Page<Order> page = orderRepository.searchOrders(
                keyword, status, req.getMinAmount(), req.getMaxAmount(), pageable);

        return PageResponse.of(page.map(o ->
                toOrderResponse(o, orderItemRepository.findByOrder_OrderId(o.getOrderId()))));
    }

    // =============================================
    // STAFF/ADMIN: Cap nhat trang thai don hang
    // Luong: PENDING -> CONFIRMED -> MANUFACTURING -> SHIPPING -> DELIVERED
    // =============================================
    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId,
                                           UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));

        validateStatusTransition(order.getStatus(), request.getStatus());
        order.setStatus(request.getStatus());
        orderRepository.save(order);

        // Khi DELIVERED -> tao MyGlasses cho tung design item
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

        OrderResponse response = toOrderResponse(
                order, orderItemRepository.findByOrder_OrderId(orderId));

        // GUI EMAIL theo tung trang thai (async)
        String email = order.getCustomer().getEmail();
        switch (request.getStatus()) {
            case "CONFIRMED"     -> emailService.sendOrderStatusConfirmed(response, email);
            case "MANUFACTURING" -> emailService.sendOrderManufacturing(response, email);
            case "SHIPPING"      -> emailService.sendOrderShipping(response, email);
            case "DELIVERED"     -> emailService.sendOrderDelivered(response, email);
        }

        return response;
    }

    // =============================================
    // STAFF/ADMIN: Huy don hang
    // =============================================
    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));
        if (!List.of("PENDING", "CONFIRMED").contains(order.getStatus())) {
            throw new RuntimeException("Chi co the huy don o trang thai PENDING hoac CONFIRMED");
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);

        OrderResponse response = toOrderResponse(
                order, orderItemRepository.findByOrder_OrderId(orderId));

        // GUI EMAIL thong bao huy (async)
        emailService.sendOrderCancelled(response, order.getCustomer().getEmail());

        return response;
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================

    private void validateStatusTransition(String current, String next) {
        List<String> valid = switch (current) {
            case "PENDING"       -> List.of("CONFIRMED", "CANCELLED");
            case "CONFIRMED"     -> List.of("MANUFACTURING", "CANCELLED");
            case "MANUFACTURING" -> List.of("SHIPPING");
            case "SHIPPING"      -> List.of("DELIVERED");
            default              -> List.of();
        };
        if (!valid.contains(next)) {
            throw new RuntimeException("Khong the chuyen tu " + current + " sang " + next);
        }
    }

    private String buildSnapshot(CartItem ci) {
        try {
            if (ci.getDesignId() != null) {
                // Kinh theo thiet ke
                GlassesDesign d = glassesDesignRepository.findById(ci.getDesignId()).orElse(null);
                if (d == null) return "{}";
                var map = new HashMap<String, Object>();
                map.put("type",       "CUSTOM_GLASSES");
                map.put("designId",   d.getDesignId());
                map.put("designName", d.getDesignName());
                map.put("frameName",  d.getFrame().getName());
                map.put("lensName",   d.getLens().getName());
                map.put("totalPrice", d.getTotalPrice());
                return objectMapper.writeValueAsString(map);
            } else if (ci.getFrameId() != null) {
                // Chi gong kinh (FRAME_ONLY)
                Frame f = frameRepository.findById(ci.getFrameId()).orElse(null);
                if (f == null) return "{}";
                var map = new HashMap<String, Object>();
                map.put("type",    "FRAME_ONLY");
                map.put("frameId", f.getFrameId());
                map.put("name",    f.getName());
                map.put("brand",   f.getBrand());
                map.put("price",   f.getPrice());
                return objectMapper.writeValueAsString(map);
            } else {
                // Kinh lam san
                ReadyMadeGlasses r = readyMadeGlassesRepository
                        .findById(ci.getReadyMadeGlassesId()).orElse(null);
                if (r == null) return "{}";
                var map = new HashMap<String, Object>();
                map.put("type",      "READY_MADE");
                map.put("productId", r.getProductId());
                map.put("name",      r.getName());
                map.put("brand",     r.getBrand());
                map.put("price",     r.getPrice());
                return objectMapper.writeValueAsString(map);
            }
        } catch (Exception e) {
            return "{}";
        }
    }

    private OrderResponse toOrderResponse(Order o, List<OrderItem> items) {
        // Lay thong tin shipment
        String shipmentStatus = null;
        String shipmentNote   = null;
        LocalDateTime deliveredAt = null;
        try {
            var shipOpt = shipmentRepository.findByOrder_OrderId(o.getOrderId());
            if (shipOpt.isPresent()) {
                var ship = shipOpt.get();
                shipmentStatus = ship.getStatus();
                shipmentNote   = ship.getTrackingNote();
                deliveredAt    = ship.getDeliveredAt();
            }
        } catch (Exception ignored) {}

        List<OrderItemResponse> itemResponses = items.stream()
                .map(this::toOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(o.getOrderId())
                .customerId(o.getCustomer().getCustomerId())
                .customerName(o.getCustomer().getName())
                .customerPhone(o.getCustomer().getPhone())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .discountAmount(o.getDiscountAmount())
                .finalAmount(o.getFinalAmount())
                .discountCode(o.getDiscount() != null ? o.getDiscount().getCode() : null)
                .shippingAddress(o.getShippingAddress())
                .shipmentStatus(shipmentStatus)
                .shipmentNote(shipmentNote)
                .deliveredAt(deliveredAt)
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .items(itemResponses)
                .build();
    }

    @SuppressWarnings("unchecked")
    private OrderItemResponse toOrderItemResponse(OrderItem i) {
        String productName = null;
        String frameName   = null;
        String lensName    = null;
        String brand       = null;

        try {
            if (i.getProductSnapshot() != null && !i.getProductSnapshot().isBlank()) {
                Map<String, Object> snap = objectMapper.readValue(
                        i.getProductSnapshot(), new TypeReference<>() {});
                productName = (String) snap.getOrDefault("designName",
                        snap.getOrDefault("name", null));
                frameName   = (String) snap.get("frameName");
                lensName    = (String) snap.get("lensName");
                brand       = (String) snap.get("brand");
            }
        } catch (Exception ignored) {}

        if (productName == null) {
            productName = i.getDesignId() != null
                    ? "Kinh thiet ke #" + i.getDesignId()
                    : "San pham #" + i.getReadyMadeGlassesId();
        }

        return OrderItemResponse.builder()
                .orderItemId(i.getOrderItemId())
                .itemType(i.getItemType())
                .designId(i.getDesignId())
                .readyMadeGlassesId(i.getReadyMadeGlassesId())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .subtotal(i.getSubtotal())
                .productSnapshot(i.getProductSnapshot())
                .productName(productName)
                .frameName(frameName)
                .lensName(lensName)
                .brand(brand)
                .build();
    }
}