package org.group5.springmvcweb.glassesweb;

import org.group5.springmvcweb.glassesweb.DTO.AddToCartRequest;
import org.group5.springmvcweb.glassesweb.DTO.CartResponse;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.Service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho CartService — bao phủ toàn bộ luồng giỏ hàng.
 *
 * Cách chạy: mvn test -Dtest=CartServiceTest
 *
 * Các luồng được test:
 *  - getOrCreateCart: đã có giỏ, chưa có giỏ (tạo mới)
 *  - addToCart: kính làm sẵn, custom design, validation (thiếu product / cả 2 / design sai chủ)
 *  - removeFromCart: thành công, item không tồn tại, item của người khác
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CartService — Unit Tests")
class CartServiceTest {

    // ── Mocks ──────────────────────────────────────────────────────────────────
    @Mock private CartRepository               cartRepository;
    @Mock private CartItemRepository           cartItemRepository;
    @Mock private CustomerRepository           customerRepository;
    @Mock private GlassesDesignRepository      glassesDesignRepository;
    @Mock private ReadyMadeGlassesRepository   readyMadeGlassesRepository;

    @InjectMocks
    private CartService cartService;

    // ── Fixtures ───────────────────────────────────────────────────────────────
    private Customer        customer;
    private Cart            existingCart;
    private ReadyMadeGlasses readyProduct;
    private GlassesDesign   customerDesign;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId(1)
                .name("Trần Thị B")
                .email("b@gmail.com")
                .phone("0912345678")
                .status("ACTIVE")
                .build();

        existingCart = Cart.builder()
                .cartId(10)
                .customer(customer)
                .build();

        readyProduct = ReadyMadeGlasses.builder()
                .productId(200)
                .name("Oakley Sport")
                .brand("Oakley")
                .price(new BigDecimal("2000000"))
                .build();

        // Design thuộc về customer 1
        customerDesign = GlassesDesign.builder()
                .designId(300)
                .designName("Kính cận cá tính")
                .customer(customer)
                .totalPrice(new BigDecimal("3500000"))
                .build();
    }

    // ════════════════════════════════════════════════════════════════
    // getOrCreateCart()
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getOrCreateCart()")
    class GetOrCreateCartTests {

        @Test
        @DisplayName("đã có giỏ hàng → trả về giỏ hiện tại, không tạo mới")
        void getOrCreateCart_exists_returnsExistingCart() {
            when(cartRepository.findByCustomer_CustomerId(1))
                    .thenReturn(Optional.of(existingCart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of());

            CartResponse res = cartService.getOrCreateCart(1);

            assertThat(res).isNotNull();
            assertThat(res.getCartId()).isEqualTo(10);
            assertThat(res.getCustomerId()).isEqualTo(1);

            // Không được gọi save (không tạo mới)
            verify(cartRepository, never()).save(any());
        }

        @Test
        @DisplayName("chưa có giỏ hàng → tạo mới và trả về")
        void getOrCreateCart_notExists_createsNew() {
            Cart newCart = Cart.builder().cartId(20).customer(customer).build();

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.empty());
            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.save(any(Cart.class))).thenReturn(newCart);
            when(cartItemRepository.findByCart_CartId(20)).thenReturn(List.of());

            CartResponse res = cartService.getOrCreateCart(1);

            assertThat(res.getCartId()).isEqualTo(20);
            verify(cartRepository, times(1)).save(any(Cart.class));
        }

        @Test
        @DisplayName("customer không tồn tại khi tạo giỏ → RuntimeException")
        void getOrCreateCart_customerNotFound_throwsException() {
            when(cartRepository.findByCustomer_CustomerId(99)).thenReturn(Optional.empty());
            when(customerRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.getOrCreateCart(99))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("khách hàng");
        }
    }

    // ════════════════════════════════════════════════════════════════
    // addToCart()
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("addToCart()")
    class AddToCartTests {

        @Test
        @DisplayName("thêm kính làm sẵn → CartItem được lưu với giá đúng")
        void addToCart_readyMade_savesItemWithCorrectPrice() {
            AddToCartRequest req = new AddToCartRequest();
            req.setReadyMadeGlassesId(200);
            req.setQuantity(2);

            CartItem savedItem = CartItem.builder()
                    .cartItemId(1)
                    .cart(existingCart)
                    .readyMadeGlassesId(200)
                    .quantity(2)
                    .unitPrice(new BigDecimal("2000000"))
                    .build();

            Cart refreshedCart = Cart.builder().cartId(10).customer(customer).build();

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(readyMadeGlassesRepository.findById(200)).thenReturn(Optional.of(readyProduct));
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(savedItem);
            when(cartRepository.findById(10)).thenReturn(Optional.of(refreshedCart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(savedItem));

            CartResponse res = cartService.addToCart(1, req);

            assertThat(res).isNotNull();
            assertThat(res.getItems()).hasSize(1);
            assertThat(res.getItems().get(0).getUnitPrice())
                    .isEqualByComparingTo(new BigDecimal("2000000"));

            // Verify CartItem được save với đúng unitPrice
            verify(cartItemRepository, times(1)).save(argThat(item ->
                    item.getUnitPrice().compareTo(new BigDecimal("2000000")) == 0
                            && item.getQuantity() == 2
                            && item.getReadyMadeGlassesId() == 200
            ));
        }

        @Test
        @DisplayName("thêm custom design của chính mình → thành công")
        void addToCart_ownDesign_success() {
            AddToCartRequest req = new AddToCartRequest();
            req.setDesignId(300);
            req.setQuantity(1);

            CartItem savedItem = CartItem.builder()
                    .cartItemId(2)
                    .cart(existingCart)
                    .designId(300)
                    .quantity(1)
                    .unitPrice(new BigDecimal("3500000"))
                    .build();

            Cart refreshedCart = Cart.builder().cartId(10).customer(customer).build();

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(glassesDesignRepository.findById(300)).thenReturn(Optional.of(customerDesign));
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(savedItem);
            when(cartRepository.findById(10)).thenReturn(Optional.of(refreshedCart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(savedItem));

            CartResponse res = cartService.addToCart(1, req);

            assertThat(res.getItems().get(0).getDesignId()).isEqualTo(300);
            verify(cartItemRepository, times(1)).save(argThat(item ->
                    item.getUnitPrice().compareTo(new BigDecimal("3500000")) == 0
            ));
        }

        @Test
        @DisplayName("thêm design của người khác → RuntimeException (unauthorized)")
        void addToCart_otherCustomerDesign_throwsException() {
            Customer otherCustomer = Customer.builder()
                    .customerId(2).name("Khác").build();

            GlassesDesign otherDesign = GlassesDesign.builder()
                    .designId(301)
                    .designName("Design của người khác")
                    .customer(otherCustomer) // owner là customer 2
                    .totalPrice(new BigDecimal("2000000"))
                    .build();

            AddToCartRequest req = new AddToCartRequest();
            req.setDesignId(301);
            req.setQuantity(1);

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(glassesDesignRepository.findById(301)).thenReturn(Optional.of(otherDesign));

            // Customer 1 cố thêm design của customer 2
            assertThatThrownBy(() -> cartService.addToCart(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("không thuộc về bạn");

            verify(cartItemRepository, never()).save(any());
        }

        @Test
        @DisplayName("không truyền designId lẫn readyMadeGlassesId → RuntimeException")
        void addToCart_noProductSpecified_throwsException() {
            AddToCartRequest req = new AddToCartRequest();
            req.setQuantity(1);
            // cả 2 đều null

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));

            assertThatThrownBy(() -> cartService.addToCart(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Vui lòng chọn");

            verify(cartItemRepository, never()).save(any());
        }

        @Test
        @DisplayName("truyền cả designId lẫn readyMadeGlassesId → RuntimeException")
        void addToCart_bothProductsSpecified_throwsException() {
            AddToCartRequest req = new AddToCartRequest();
            req.setDesignId(300);
            req.setReadyMadeGlassesId(200);
            req.setQuantity(1);

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));

            assertThatThrownBy(() -> cartService.addToCart(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Chỉ được chọn 1");

            verify(cartItemRepository, never()).save(any());
        }

        @Test
        @DisplayName("sản phẩm ready-made không tồn tại → RuntimeException")
        void addToCart_readyMadeNotFound_throwsException() {
            AddToCartRequest req = new AddToCartRequest();
            req.setReadyMadeGlassesId(9999);
            req.setQuantity(1);

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(readyMadeGlassesRepository.findById(9999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.addToCart(1, req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Không tìm thấy sản phẩm");
        }

        @Test
        @DisplayName("chưa có giỏ hàng khi addToCart → tạo mới giỏ rồi thêm item")
        void addToCart_noExistingCart_createsCartFirst() {
            AddToCartRequest req = new AddToCartRequest();
            req.setReadyMadeGlassesId(200);
            req.setQuantity(1);

            Cart newCart = Cart.builder().cartId(20).customer(customer).build();
            CartItem savedItem = CartItem.builder()
                    .cartItemId(3).cart(newCart).readyMadeGlassesId(200).quantity(1)
                    .unitPrice(new BigDecimal("2000000")).build();

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.empty());
            when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
            when(cartRepository.save(any())).thenReturn(newCart);
            when(readyMadeGlassesRepository.findById(200)).thenReturn(Optional.of(readyProduct));
            when(cartItemRepository.save(any())).thenReturn(savedItem);
            when(cartRepository.findById(20)).thenReturn(Optional.of(newCart));
            when(cartItemRepository.findByCart_CartId(20)).thenReturn(List.of(savedItem));

            CartResponse res = cartService.addToCart(1, req);

            assertThat(res.getItems()).hasSize(1);
            // Cart mới được tạo trước khi save item
            verify(cartRepository, times(1)).save(any(Cart.class));
            verify(cartItemRepository, times(1)).save(any(CartItem.class));
        }
    }

    // ════════════════════════════════════════════════════════════════
    // removeFromCart()
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("removeFromCart()")
    class RemoveFromCartTests {

        @Test
        @DisplayName("xoá item hợp lệ → CartItem bị delete")
        void removeFromCart_validItem_deletesItem() {
            CartItem item = CartItem.builder()
                    .cartItemId(1)
                    .cart(existingCart)
                    .readyMadeGlassesId(200)
                    .quantity(1)
                    .unitPrice(new BigDecimal("2000000"))
                    .build();

            Cart refreshedCart = Cart.builder().cartId(10).customer(customer).build();

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(cartItemRepository.findById(1)).thenReturn(Optional.of(item));
            when(cartRepository.findById(10)).thenReturn(Optional.of(refreshedCart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of());

            CartResponse res = cartService.removeFromCart(1, 1);

            verify(cartItemRepository, times(1)).delete(item);
            assertThat(res.getItems()).isEmpty();
        }

        @Test
        @DisplayName("item không tồn tại → RuntimeException")
        void removeFromCart_itemNotFound_throwsException() {
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(cartItemRepository.findById(9999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.removeFromCart(1, 9999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Không tìm thấy item");

            verify(cartItemRepository, never()).delete(any());
        }

        @Test
        @DisplayName("item thuộc giỏ hàng người khác → RuntimeException (security check)")
        void removeFromCart_itemBelongsToOtherCart_throwsException() {
            // Cart của customer 2
            Customer otherCustomer = Customer.builder().customerId(2).build();
            Cart otherCart = Cart.builder().cartId(99).customer(otherCustomer).build();

            // Item thuộc cart 99 (của customer 2)
            CartItem foreignItem = CartItem.builder()
                    .cartItemId(5)
                    .cart(otherCart)
                    .readyMadeGlassesId(200)
                    .quantity(1)
                    .unitPrice(new BigDecimal("2000000"))
                    .build();

            // Customer 1 cố xoá item của customer 2
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(cartItemRepository.findById(5)).thenReturn(Optional.of(foreignItem));

            assertThatThrownBy(() -> cartService.removeFromCart(1, 5))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("không thuộc giỏ hàng của bạn");

            // Không được xoá item của người khác
            verify(cartItemRepository, never()).delete(any());
        }

        @Test
        @DisplayName("giỏ hàng không tồn tại → RuntimeException")
        void removeFromCart_noCart_throwsException() {
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.removeFromCart(1, 1))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("giỏ hàng");
        }
    }

    // ════════════════════════════════════════════════════════════════
    // Total amount calculation
    // ════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Total amount calculation")
    class TotalAmountTests {

        @Test
        @DisplayName("giỏ nhiều item → totalAmount = sum đúng")
        void cart_multipleItems_totalAmountCorrect() {
            CartItem item1 = CartItem.builder()
                    .cartItemId(1).cart(existingCart)
                    .readyMadeGlassesId(200).quantity(2)
                    .unitPrice(new BigDecimal("1000000")).build();

            CartItem item2 = CartItem.builder()
                    .cartItemId(2).cart(existingCart)
                    .readyMadeGlassesId(201).quantity(1)
                    .unitPrice(new BigDecimal("500000")).build();

            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of(item1, item2));

            // Mock tên sản phẩm cho từng item
            ReadyMadeGlasses p2 = ReadyMadeGlasses.builder()
                    .productId(201).name("Kính 2").price(new BigDecimal("500000")).build();
            when(readyMadeGlassesRepository.findById(200)).thenReturn(Optional.of(readyProduct));
            when(readyMadeGlassesRepository.findById(201)).thenReturn(Optional.of(p2));

            CartResponse res = cartService.getOrCreateCart(1);

            // item1: 2 x 1,000,000 = 2,000,000
            // item2: 1 x   500,000 =   500,000
            // total = 2,500,000
            assertThat(res.getTotalAmount()).isEqualByComparingTo(new BigDecimal("2500000"));
            assertThat(res.getItems()).hasSize(2);
        }

        @Test
        @DisplayName("giỏ rỗng → totalAmount = 0")
        void cart_empty_totalAmountIsZero() {
            when(cartRepository.findByCustomer_CustomerId(1)).thenReturn(Optional.of(existingCart));
            when(cartItemRepository.findByCart_CartId(10)).thenReturn(List.of());

            CartResponse res = cartService.getOrCreateCart(1);

            assertThat(res.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(res.getItems()).isEmpty();
        }
    }
}