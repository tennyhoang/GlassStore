package org.group5.springmvcweb.glassesweb;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.group5.springmvcweb.glassesweb.DTO.OrderResponse;
import org.group5.springmvcweb.glassesweb.DTO.PlaceOrderRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateOrderStatusRequest;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.Service.GlassesDesignService;
import org.group5.springmvcweb.glassesweb.Service.OrderService;
import org.group5.springmvcweb.glassesweb.security.EyeProfileAccessDeniedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho OrderService — bao phủ toàn bộ luồng nghiệp vụ đặt hàng.
 *
 * Cách chạy: mvn test -Dtest=OrderServiceTest
 *
 * Các luồng được test:
 *  - placeOrder: thành công, giỏ trống, mã giảm giá (hợp lệ / hết hạn / vượt limit / hết lượt)
 *  - validateStatusTransition: tất cả cặp hợp lệ và không hợp lệ
 *  - cancelOrder: thành công, cancel khi đã SHIPPING
 *  - getOrderDetail: đúng chủ, sai chủ (unauthorized)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService — Unit Tests")
class OrderServiceTest {

    // ── Mocks ──────────────────────────────────────────────────────────────────
    @Mock private OrderRepository              orderRepository;
    @Mock private OrderItemRepository          orderItemRepository;
    @Mock private CartRepository               cartRepository;
    @Mock private CartItemRepository           cartItemRepository;
    @Mock private CustomerRepository           customerRepository;
    @Mock private DiscountRepository           discountRepository;
    @Mock private GlassesDesignRepository      glassesDesignRepository;
    @Mock private ReadyMadeGlassesRepository   readyMadeGlassesRepository;
    @Mock private GlassesDesignService         glassesDesignService;

    @InjectMocks
    private OrderService orderService;

    // ── Fixtures ───────────────────────────────────────────────────────────────
    private Customer     customer;
    private Cart         cart;
    private CartItem     cartItemReady;
    private Order        pendingOrder;
    private ReadyMadeGlasses readyProduct;

    @BeforeEach
    void setUp() {
        // ObjectMapper cần inject thủ công vì Mockito không mock nó
        try {
            var field = OrderService.class.getDeclaredField("objectMapper");
            field.setAccessible(true);
            field.set(orderService, new ObjectMapper());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        customer = Customer.builder()
                .customerId(1)
                .name("Nguyễn Văn A")
                .email("a@gmail.com")
                .phone("0901234567")
                .status("ACTIVE")
                .build();

        cart = Cart.builder()
                .cartId(10)
                .customer(customer)
                .build();

        readyProduct = ReadyMadeGlasses.builder()
                .productId(100)
                .name("Ray-Ban Classic")
                .brand("Ray-Ban")
                .price(new BigDecimal("1500000"))
                .build();

        cartItemReady = CartItem.builder()
                .cartItemId(1)
                .cart(cart)
                .readyMadeGlassesId(100)
                .quantity(2)
                .unitPrice(new BigDecimal("1500000"))
                .build();

        pendingOrder = Order.builder()
                .orderId(50)
                .customer(customer)
                .status("PENDING")
                .totalAmount(new BigDecimal("3000000"))
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("3000000"))
                .shippingAddress("123 Lê Lợi, Q1, TP.HCM")
                .build();
    }

    // ════════════════════════════════════════════════════════════════
    // placeOrder()
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("placeOrder()")
    class PlaceOrderTests {

        @Test
        @DisplayName("thành công — kính làm sẵn, không dùng mã giảm giá")
        void placeOrder_readyMade_noDiscount_success() {
            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("123 Lê Lợi, Q1");
            req.setDiscountCode(null);

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(orderRepository.save(any(Order.class))).thenReturn(pendingOrder);
            when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
                OrderItem oi = inv.getArgument(0);
                oi.setOrderItemId(1);
                return oi;
            });
            when(readyMadeGlassesRepository.findById(100)).thenReturn(Optional.of(readyProduct));

            OrderResponse res = orderService.placeOrder(1, req);

            assertThat(res).isNotNull();
            assertThat(res.getStatus()).isEqualTo("PENDING");
            assertThat(res.getTotalAmount()).isEqualByComparingTo(new BigDecimal("3000000"));
            assertThat(res.getDiscountAmount()).isEqualByComparingTo(BigDecimal.ZERO);

            verify(orderRepository, times(1)).save(any(Order.class));
            verify(cartItemRepository, times(1)).deleteByCart_CartId(10);
        }

        @Test
        @DisplayName("giỏ hàng không tồn tại → RuntimeException")
        void placeOrder_noCart_throwsException() {
            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("123 Lê Lợi");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.placeOrder(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Giỏ hàng trống");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("giỏ hàng rỗng (không có items) → RuntimeException")
        void placeOrder_emptyCartItems_throwsException() {
            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("123 Lê Lợi");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of());

            assertThatThrownBy(() -> orderService.placeOrder(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Giỏ hàng trống");
        }

        // ── Discount scenarios ──────────────────────────────────────

        @Test
        @DisplayName("mã giảm giá PERCENTAGE hợp lệ → tính đúng finalAmount")
        void placeOrder_percentageDiscount_calculatesCorrectly() {
            // 10% giảm trên đơn 3,000,000 → giảm 300,000 → còn 2,700,000
            Discount discount10pct = Discount.builder()
                    .discountId(5)
                    .code("SUMMER10")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("10"))
                    .usedCount(0)
                    .status("ACTIVE")
                    .build();

            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("Hà Nội");
            req.setDiscountCode("SUMMER10");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("SUMMER10", "ACTIVE"))
                    .thenReturn(Optional.of(discount10pct));
            when(discountRepository.save(any(Discount.class))).thenReturn(discount10pct);

            Order discountedOrder = Order.builder()
                    .orderId(51)
                    .customer(customer)
                    .status("PENDING")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(new BigDecimal("300000"))
                    .finalAmount(new BigDecimal("2700000"))
                    .discount(discount10pct)
                    .shippingAddress("Hà Nội")
                    .build();

            when(orderRepository.save(any(Order.class))).thenReturn(discountedOrder);
            when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
                OrderItem oi = inv.getArgument(0);
                oi.setOrderItemId(2);
                return oi;
            });
            when(readyMadeGlassesRepository.findById(100)).thenReturn(Optional.of(readyProduct));

            OrderResponse res = orderService.placeOrder(1, req);

            assertThat(res.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("300000"));
            assertThat(res.getFinalAmount()).isEqualByComparingTo(new BigDecimal("2700000"));
            assertThat(res.getDiscountCode()).isEqualTo("SUMMER10");

            // usedCount phải tăng lên 1
            verify(discountRepository, times(1)).save(argThat(d -> d.getUsedCount() == 1));
        }

        @Test
        @DisplayName("mã giảm giá FIXED hợp lệ → tính đúng")
        void placeOrder_fixedDiscount_calculatesCorrectly() {
            // Giảm cố định 200,000 trên đơn 3,000,000
            Discount discountFixed = Discount.builder()
                    .discountId(6)
                    .code("FIXED200K")
                    .discountType("FIXED")
                    .discountValue(new BigDecimal("200000"))
                    .usedCount(0)
                    .status("ACTIVE")
                    .build();

            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("TP.HCM");
            req.setDiscountCode("FIXED200K");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("FIXED200K", "ACTIVE"))
                    .thenReturn(Optional.of(discountFixed));
            when(discountRepository.save(any())).thenReturn(discountFixed);

            Order fixedOrder = Order.builder()
                    .orderId(52)
                    .customer(customer)
                    .status("PENDING")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(new BigDecimal("200000"))
                    .finalAmount(new BigDecimal("2800000"))
                    .discount(discountFixed)
                    .shippingAddress("TP.HCM")
                    .build();

            when(orderRepository.save(any())).thenReturn(fixedOrder);
            when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
                OrderItem oi = inv.getArgument(0);
                oi.setOrderItemId(3);
                return oi;
            });
            when(readyMadeGlassesRepository.findById(100)).thenReturn(Optional.of(readyProduct));

            OrderResponse res = orderService.placeOrder(1, req);

            assertThat(res.getFinalAmount()).isEqualByComparingTo(new BigDecimal("2800000"));
        }

        @Test
        @DisplayName("mã giảm giá đã hết hạn → RuntimeException")
        void placeOrder_expiredDiscount_throwsException() {
            Discount expired = Discount.builder()
                    .discountId(7)
                    .code("EXPIRED")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("20"))
                    .usedCount(0)
                    .status("ACTIVE")
                    .expiresAt(LocalDateTime.now().minusDays(1)) // hết hạn hôm qua
                    .build();

            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("TP.HCM");
            req.setDiscountCode("EXPIRED");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("EXPIRED", "ACTIVE"))
                    .thenReturn(Optional.of(expired));

            assertThatThrownBy(() -> orderService.placeOrder(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("đã hết hạn");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("mã giảm giá đã hết lượt sử dụng → RuntimeException")
        void placeOrder_discountUsageLimitExceeded_throwsException() {
            Discount maxedOut = Discount.builder()
                    .discountId(8)
                    .code("MAXED")
                    .discountType("FIXED")
                    .discountValue(new BigDecimal("100000"))
                    .usageLimit(100)
                    .usedCount(100) // đã hết
                    .status("ACTIVE")
                    .build();

            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("TP.HCM");
            req.setDiscountCode("MAXED");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("MAXED", "ACTIVE"))
                    .thenReturn(Optional.of(maxedOut));

            assertThatThrownBy(() -> orderService.placeOrder(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("hết lượt");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("mã giảm giá đòi đơn tối thiểu chưa đạt → RuntimeException")
        void placeOrder_discountMinOrderNotMet_throwsException() {
            // Đơn 3,000,000 nhưng mã đòi tối thiểu 5,000,000
            Discount highMin = Discount.builder()
                    .discountId(9)
                    .code("HIGHMIN")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("15"))
                    .minOrderValue(new BigDecimal("5000000"))
                    .usedCount(0)
                    .status("ACTIVE")
                    .build();

            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("Đà Nẵng");
            req.setDiscountCode("HIGHMIN");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("HIGHMIN", "ACTIVE"))
                    .thenReturn(Optional.of(highMin));

            assertThatThrownBy(() -> orderService.placeOrder(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("tối thiểu");
        }

        @Test
        @DisplayName("mã giảm giá không tồn tại → RuntimeException")
        void placeOrder_invalidDiscountCode_throwsException() {
            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("TP.HCM");
            req.setDiscountCode("KHONGTONTAL");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("KHONGTONTAL", "ACTIVE"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.placeOrder(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("không hợp lệ");
        }

        @Test
        @DisplayName("giảm giá FIXED lớn hơn tổng tiền → finalAmount không âm (= 0)")
        void placeOrder_discountExceedsTotal_finalAmountIsZero() {
            // Giảm 10,000,000 nhưng đơn chỉ 3,000,000 → finalAmount = 0, không âm
            Discount bigDiscount = Discount.builder()
                    .discountId(10)
                    .code("BIGDISCOUNT")
                    .discountType("FIXED")
                    .discountValue(new BigDecimal("10000000"))
                    .usedCount(0)
                    .status("ACTIVE")
                    .build();

            PlaceOrderRequest req = new PlaceOrderRequest();
            req.setShippingAddress("TP.HCM");
            req.setDiscountCode("BIGDISCOUNT");

            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(cart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(cartItemReady));
            when(discountRepository.findByCodeAndStatus("BIGDISCOUNT", "ACTIVE"))
                    .thenReturn(Optional.of(bigDiscount));
            when(discountRepository.save(any())).thenReturn(bigDiscount);

            // discountAmount bị cap = totalAmount = 3,000,000 → finalAmount = 0
            Order zeroOrder = Order.builder()
                    .orderId(53)
                    .customer(customer)
                    .status("PENDING")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(new BigDecimal("3000000"))
                    .finalAmount(BigDecimal.ZERO)
                    .discount(bigDiscount)
                    .shippingAddress("TP.HCM")
                    .build();

            when(orderRepository.save(any())).thenReturn(zeroOrder);
            when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
                OrderItem oi = inv.getArgument(0);
                oi.setOrderItemId(4);
                return oi;
            });
            when(readyMadeGlassesRepository.findById(100)).thenReturn(Optional.of(readyProduct));

            OrderResponse res = orderService.placeOrder(1, req);

            // finalAmount không được âm
            assertThat(res.getFinalAmount().compareTo(BigDecimal.ZERO)).isGreaterThanOrEqualTo(0);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // validateStatusTransition() — via updateOrderStatus()
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Status Transition Validation")
    class StatusTransitionTests {

        @Test
        @DisplayName("PENDING → CONFIRMED hợp lệ")
        void transition_pendingToConfirmed_valid() {
            UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
            req.setStatus("CONFIRMED");

            when(orderRepository.findById(50)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenReturn(pendingOrder);
            when(orderItemRepository.findByOrder_OrderId(50)).thenReturn(List.of());

            assertThatCode(() -> orderService.updateOrderStatus(50, req))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("PENDING → MANUFACTURING không hợp lệ → RuntimeException")
        void transition_pendingToManufacturing_invalid() {
            UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
            req.setStatus("MANUFACTURING");

            when(orderRepository.findById(50)).thenReturn(Optional.of(pendingOrder));

            assertThatThrownBy(() -> orderService.updateOrderStatus(50, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Không thể chuyển");
        }

        @Test
        @DisplayName("CONFIRMED → MANUFACTURING hợp lệ")
        void transition_confirmedToManufacturing_valid() {
            Order confirmed = Order.builder()
                    .orderId(51).customer(customer).status("CONFIRMED")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(new BigDecimal("3000000")).build();

            UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
            req.setStatus("MANUFACTURING");

            when(orderRepository.findById(51)).thenReturn(Optional.of(confirmed));
            when(orderRepository.save(any())).thenReturn(confirmed);
            when(orderItemRepository.findByOrder_OrderId(51)).thenReturn(List.of());

            assertThatCode(() -> orderService.updateOrderStatus(51, req))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("SHIPPING → DELIVERED tạo MyGlasses cho CUSTOM_GLASSES item")
        void transition_shippingToDelivered_createsMyGlasses() {
            Order shipping = Order.builder()
                    .orderId(52).customer(customer).status("SHIPPING")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(new BigDecimal("3000000")).build();

            OrderItem customItem = OrderItem.builder()
                    .orderItemId(10)
                    .order(shipping)
                    .itemType("CUSTOM_GLASSES")
                    .designId(999)
                    .quantity(1)
                    .unitPrice(new BigDecimal("3000000"))
                    .subtotal(new BigDecimal("3000000"))
                    .build();

            UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
            req.setStatus("DELIVERED");

            when(orderRepository.findById(52)).thenReturn(Optional.of(shipping));
            when(orderRepository.save(any())).thenReturn(shipping);
            when(orderItemRepository.findByOrder_OrderId(52)).thenReturn(List.of(customItem));

            orderService.updateOrderStatus(52, req);

            // Phải gọi createMyGlasses sau khi DELIVERED
            verify(glassesDesignService, times(1))
                    .createMyGlasses(customer.getCustomerId(), 999, 52);
        }

        @Test
        @DisplayName("DELIVERED → CANCELLED không hợp lệ → RuntimeException")
        void transition_deliveredToCancelled_invalid() {
            Order delivered = Order.builder()
                    .orderId(53).customer(customer).status("DELIVERED")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(new BigDecimal("3000000")).build();

            UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
            req.setStatus("CANCELLED");

            when(orderRepository.findById(53)).thenReturn(Optional.of(delivered));

            assertThatThrownBy(() -> orderService.updateOrderStatus(53, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Không thể chuyển");
        }
    }

    // ════════════════════════════════════════════════════════════════
    // cancelOrder()
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("cancelOrder()")
    class CancelOrderTests {

        @Test
        @DisplayName("huỷ đơn PENDING → thành công")
        void cancelOrder_pending_success() {
            when(orderRepository.findById(50)).thenReturn(Optional.of(pendingOrder));
            when(orderRepository.save(any())).thenReturn(pendingOrder);
            when(orderItemRepository.findByOrder_OrderId(50)).thenReturn(List.of());

            OrderResponse res = orderService.cancelOrder(50);

            verify(orderRepository, times(1)).save(argThat(o ->
                    "CANCELLED".equals(o.getStatus())));
        }

        @Test
        @DisplayName("huỷ đơn CONFIRMED → thành công")
        void cancelOrder_confirmed_success() {
            Order confirmed = Order.builder()
                    .orderId(51).customer(customer).status("CONFIRMED")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(new BigDecimal("3000000")).build();

            when(orderRepository.findById(51)).thenReturn(Optional.of(confirmed));
            when(orderRepository.save(any())).thenReturn(confirmed);
            when(orderItemRepository.findByOrder_OrderId(51)).thenReturn(List.of());

            assertThatCode(() -> orderService.cancelOrder(51))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("huỷ đơn SHIPPING → RuntimeException (không cho phép)")
        void cancelOrder_shipping_throwsException() {
            Order shipping = Order.builder()
                    .orderId(52).customer(customer).status("SHIPPING")
                    .totalAmount(new BigDecimal("3000000"))
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(new BigDecimal("3000000")).build();

            when(orderRepository.findById(52)).thenReturn(Optional.of(shipping));

            assertThatThrownBy(() -> orderService.cancelOrder(52))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("PENDING hoặc CONFIRMED");

            verify(orderRepository, never()).save(any());
        }

        @Test
        @DisplayName("huỷ đơn không tồn tại → RuntimeException")
        void cancelOrder_notFound_throwsException() {
            when(orderRepository.findById(9999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.cancelOrder(9999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("đơn hàng");
        }
    }

    // ════════════════════════════════════════════════════════════════
    // getOrderDetail()  — kiểm tra phân quyền
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getOrderDetail() — Authorization")
    class GetOrderDetailTests {

        @Test
        @DisplayName("đúng chủ đơn hàng → trả về OrderResponse")
        void getOrderDetail_correctOwner_returnsResponse() {
            when(orderRepository.existsByOrderIdAndCustomer_CustomerId(50, 1))
                    .thenReturn(true);
            when(orderRepository.findById(50)).thenReturn(Optional.of(pendingOrder));
            when(orderItemRepository.findByOrder_OrderId(50)).thenReturn(List.of());

            OrderResponse res = orderService.getOrderDetail(1, 50);

            assertThat(res).isNotNull();
            assertThat(res.getOrderId()).isEqualTo(50);
        }

        @Test
        @DisplayName("sai chủ đơn hàng (customer khác) → AccessDeniedException")
        void getOrderDetail_wrongOwner_throwsAccessDenied() {
            // customerId=2 cố truy cập đơn của customerId=1
            when(orderRepository.existsByOrderIdAndCustomer_CustomerId(50, 2))
                    .thenReturn(false);

            assertThatThrownBy(() -> orderService.getOrderDetail(2, 50))
                    .isInstanceOf(EyeProfileAccessDeniedException.class);

            verify(orderRepository, never()).findById(any());
        }
    }
}