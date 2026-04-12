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

    private final CartRepository             cartRepository;
    private final CartItemRepository         cartItemRepository;
    private final CustomerRepository         customerRepository;
    private final GlassesDesignRepository    glassesDesignRepository;
    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;
    private final FrameRepository            frameRepository;  // THEM MOI

    // =============================================
    // Lay gio hang (tao moi neu chua co)
    // =============================================
    @Transactional
    public CartResponse getOrCreateCart(Integer customerId) {
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Khong tim thay khach hang"));
                    Cart newCart = Cart.builder().customer(customer).build();
                    return cartRepository.save(newCart);
                });
        return toCartResponse(cart);
    }

    // =============================================
    // Them san pham vao gio
    // Ho tro 3 loai: CUSTOM_GLASSES | READY_MADE | FRAME_ONLY
    // =============================================
    @Transactional
    public CartResponse addToCart(Integer customerId, AddToCartRequest request) {
        // Validate: phai co dung 1 loai
        int typeCount = 0;
        if (request.getDesignId()           != null) typeCount++;
        if (request.getReadyMadeGlassesId() != null) typeCount++;
        if (request.getFrameId()            != null) typeCount++;

        if (typeCount == 0) {
            throw new RuntimeException("Vui long chon san pham (thiet ke, kinh lam san, hoac gong kinh)");
        }
        if (typeCount > 1) {
            throw new RuntimeException("Chi duoc chon 1 loai san pham moi lan them");
        }

        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Khong tim thay khach hang"));
                    return cartRepository.save(Cart.builder().customer(customer).build());
                });

        BigDecimal unitPrice;
        CartItem item;

        if (request.getDesignId() != null) {
            // Loai 1: Kinh theo thiet ke
            GlassesDesign design = glassesDesignRepository.findById(request.getDesignId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay design"));
            if (!design.getCustomer().getCustomerId().equals(customerId)) {
                throw new RuntimeException("Design nay khong thuoc ve ban");
            }
            unitPrice = design.getTotalPrice();
            item = CartItem.builder()
                    .cart(cart)
                    .designId(request.getDesignId())
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();

        } else if (request.getReadyMadeGlassesId() != null) {
            // Loai 2: Kinh lam san
            ReadyMadeGlasses product = readyMadeGlassesRepository
                    .findById(request.getReadyMadeGlassesId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay san pham"));
            unitPrice = product.getPrice();
            item = CartItem.builder()
                    .cart(cart)
                    .readyMadeGlassesId(request.getReadyMadeGlassesId())
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();

        } else {
            // Loai 3: Chi gong kinh (FRAME_ONLY) — THEM MOI
            Frame frame = frameRepository.findById(request.getFrameId())
                    .orElseThrow(() -> new RuntimeException("Khong tim thay gong kinh"));
            if (!"AVAILABLE".equals(frame.getStatus())) {
                throw new RuntimeException("Gong kinh nay hien khong ban");
            }
            unitPrice = frame.getPrice();
            item = CartItem.builder()
                    .cart(cart)
                    .frameId(request.getFrameId())
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
        }

        cartItemRepository.save(item);
        return toCartResponse(cartRepository.findById(cart.getCartId()).get());
    }

    // =============================================
    // Xoa 1 item khoi gio
    // =============================================
    @Transactional
    public CartResponse removeFromCart(Integer customerId, Integer cartItemId) {
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay gio hang"));
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay item"));
        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new RuntimeException("Item nay khong thuoc gio hang cua ban");
        }
        cartItemRepository.delete(item);
        return toCartResponse(cartRepository.findById(cart.getCartId()).get());
    }

    // =============================================
    // Xoa toan bo gio hang (sau khi dat hang)
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
                    String itemType;
                    String name = null;
                    Integer frameId = null;
                    String frameName = null;

                    if (i.getDesignId() != null) {
                        itemType = "CUSTOM_GLASSES";
                        name = glassesDesignRepository.findById(i.getDesignId())
                                .map(d -> d.getDesignName() != null
                                        ? d.getDesignName()
                                        : "Kinh thiet ke #" + d.getDesignId())
                                .orElse("Design #" + i.getDesignId());

                    } else if (i.getReadyMadeGlassesId() != null) {
                        itemType = "READY_MADE";
                        name = readyMadeGlassesRepository.findById(i.getReadyMadeGlassesId())
                                .map(ReadyMadeGlasses::getName)
                                .orElse("San pham #" + i.getReadyMadeGlassesId());

                    } else {
                        // FRAME_ONLY
                        itemType = "FRAME_ONLY";
                        frameId = i.getFrameId();
                        Frame frame = frameRepository.findById(i.getFrameId()).orElse(null);
                        if (frame != null) {
                            frameName = frame.getName();
                            name = frame.getName() + (frame.getBrand() != null ? " (" + frame.getBrand() + ")" : "");
                        } else {
                            name = "Gong kinh #" + i.getFrameId();
                        }
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
                            .frameId(frameId)
                            .frameName(frameName)
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