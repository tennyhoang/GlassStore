package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final GlassesDesignRepository glassesDesignRepository;
    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;

    // =============================================
    // Lấy giỏ hàng (tạo mới nếu chưa có)
    // =============================================
    @Transactional
    public CartResponse getOrCreateCart(Integer customerId) {
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
                    Cart newCart = Cart.builder().customer(customer).build();
                    return cartRepository.save(newCart);
                });
        return toCartResponse(cart);
    }

    // =============================================
    // Thêm sản phẩm vào giỏ
    // =============================================
    @Transactional
    public CartResponse addToCart(Integer customerId, AddToCartRequest request) {
        // Validate: phải có đúng 1 trong 2
        if (request.getDesignId() == null && request.getReadyMadeGlassesId() == null) {
            throw new RuntimeException("Vui lòng chọn sản phẩm (design hoặc kính làm sẵn)");
        }
        if (request.getDesignId() != null && request.getReadyMadeGlassesId() != null) {
            throw new RuntimeException("Chỉ được chọn 1 loại sản phẩm mỗi lần thêm");
        }

        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
                    return cartRepository.save(Cart.builder().customer(customer).build());
                });

        BigDecimal unitPrice;
        CartItem item;

        if (request.getDesignId() != null) {
            // Kính theo design
            GlassesDesign design = glassesDesignRepository.findById(request.getDesignId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy design"));
            if (!design.getCustomer().getCustomerId().equals(customerId)) {
                throw new RuntimeException("Design này không thuộc về bạn");
            }
            unitPrice = design.getTotalPrice();
            item = CartItem.builder()
                    .cart(cart)
                    .designId(request.getDesignId())
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
        } else {
            // Kính làm sẵn
            ReadyMadeGlasses product = readyMadeGlassesRepository
                    .findById(request.getReadyMadeGlassesId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            unitPrice = product.getPrice();
            item = CartItem.builder()
                    .cart(cart)
                    .readyMadeGlassesId(request.getReadyMadeGlassesId())
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
        }

        cartItemRepository.save(item);
        return toCartResponse(cartRepository.findById(cart.getCartId()).get());
    }

    // =============================================
    // Xoá 1 item khỏi giỏ
    // =============================================
    @Transactional
    public CartResponse removeFromCart(Integer customerId, Integer cartItemId) {
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy item"));
        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new RuntimeException("Item này không thuộc giỏ hàng của bạn");
        }
        cartItemRepository.delete(item);
        return toCartResponse(cartRepository.findById(cart.getCartId()).get());
    }

    // =============================================
    // Xoá toàn bộ giỏ hàng (sau khi đặt hàng)
    // =============================================
    @Transactional
    public void clearCart(Integer customerId) {
        cartRepository.findByCustomer_CustomerId(customerId)
                .ifPresent(cart -> cartItemRepository.deleteByCart_CartId(cart.getCartId()));
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private CartResponse toCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart_CartId(cart.getCartId());

        List<CartItemResponse> itemResponses = items.stream()
                .map(i -> {
                    String itemType = i.getDesignId() != null ? "CUSTOM_GLASSES" : "READY_MADE";
                    String name = null;
                    if (i.getDesignId() != null) {
                        name = glassesDesignRepository.findById(i.getDesignId())
                                .map(d -> d.getDesignName() != null
                                        ? d.getDesignName()
                                        : "Kính thiết kế #" + d.getDesignId())
                                .orElse("Design #" + i.getDesignId());
                    } else {
                        name = readyMadeGlassesRepository.findById(i.getReadyMadeGlassesId())
                                .map(ReadyMadeGlasses::getName)
                                .orElse("Sản phẩm #" + i.getReadyMadeGlassesId());
                    }
                    BigDecimal subtotal = i.getUnitPrice()
                            .multiply(BigDecimal.valueOf(i.getQuantity()));
                    return CartItemResponse.builder()
                            .cartItemId(i.getCartItemId())
                            .itemType(itemType)
                            .designId(i.getDesignId())
                            .designName(i.getDesignId() != null ? name : null)
                            .readyMadeGlassesId(i.getReadyMadeGlassesId())
                            .productName(i.getReadyMadeGlassesId() != null ? name : null)
                            .quantity(i.getQuantity())
                            .unitPrice(i.getUnitPrice())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .customerId(cart.getCustomer().getCustomerId())
                .items(itemResponses)
                .totalAmount(total)
                .build();
    }
}