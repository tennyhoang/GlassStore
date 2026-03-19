package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.ShipmentResponse;
import org.group5.springmvcweb.glassesweb.DTO.UpdateOrderStatusRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateShipmentStatusRequest;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Order;
import org.group5.springmvcweb.glassesweb.Entity.Shipment;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.OrderRepository;
import org.group5.springmvcweb.glassesweb.Repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ShipmentService
 *
 * Luồng:
 *   ManufacturingOrder COMPLETED → createShipment() tự động (PENDING)
 *   SHIPPER nhận đơn             → PICKED_UP
 *   SHIPPER đang giao            → DELIVERING
 *   SHIPPER giao xong            → DELIVERED → Order chuyển DELIVERED
 *   SHIPPER giao thất bại        → FAILED
 */
@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final OrderService orderService;

    // =============================================
    // INTERNAL: Tạo Shipment (gọi từ ManufacturingOrderService)
    // =============================================
    @Transactional
    public ShipmentResponse createShipment(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (shipmentRepository.findByOrder_OrderId(orderId).isPresent()) {
            throw new RuntimeException("Shipment cho đơn này đã tồn tại");
        }

        Shipment shipment = Shipment.builder()
                .order(order)
                .shippingAddress(order.getShippingAddress())
                .status("PENDING")
                .build();

        shipment = shipmentRepository.save(shipment);
        return toResponse(shipment);
    }

    // =============================================
    // SHIPPER: Xem đơn giao của mình
    // =============================================
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getMyShipments(Integer accountId) {
        return shipmentRepository
                .findByShipper_AccountIdOrderByCreatedAtDesc(accountId)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // STAFF/ADMIN: Xem tất cả shipment theo status
    // =============================================
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getByStatus(String status) {
        return shipmentRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // STAFF/ADMIN: Xem chi tiết 1 shipment
    // =============================================
    @Transactional(readOnly = true)
    public ShipmentResponse getById(Integer shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy shipment ID: " + shipmentId));
        return toResponse(shipment);
    }

    // =============================================
    // STAFF/ADMIN: Gán shipper cho đơn giao
    // =============================================
    @Transactional
    public ShipmentResponse assignShipper(Integer shipmentId, Integer shipperAccountId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy shipment ID: " + shipmentId));

        Account shipper = accountRepository.findById(shipperAccountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản shipper"));

        if (!"SHIPPER".equals(shipper.getRole())) {
            throw new RuntimeException("Tài khoản này không phải SHIPPER");
        }

        shipment.setShipper(shipper);
        shipment = shipmentRepository.save(shipment);
        return toResponse(shipment);
    }

    // =============================================
    // SHIPPER: Cập nhật trạng thái giao hàng
    // PENDING → PICKED_UP → DELIVERING → DELIVERED | FAILED
    // =============================================
    @Transactional
    public ShipmentResponse updateStatus(Integer shipmentId, Integer accountId,
                                         UpdateShipmentStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy shipment ID: " + shipmentId));

        // Chỉ shipper được gán mới cập nhật được
        if (shipment.getShipper() == null ||
                !shipment.getShipper().getAccountId().equals(accountId)) {
            throw new RuntimeException("Bạn không được phân công đơn giao hàng này");
        }

        validateStatusTransition(shipment.getStatus(), request.getStatus());

        shipment.setStatus(request.getStatus());
        if (request.getTrackingNote() != null) {
            shipment.setTrackingNote(request.getTrackingNote());
        }

        if ("DELIVERED".equals(request.getStatus())) {
            shipment.setDeliveredAt(LocalDateTime.now());
            // Order → DELIVERED (trigger tạo MyGlasses trong OrderService)
            orderService.updateOrderStatus(
                    shipment.getOrder().getOrderId(),
                    new UpdateOrderStatusRequest("DELIVERED")
            );
        }

        shipment = shipmentRepository.save(shipment);
        return toResponse(shipment);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private void validateStatusTransition(String current, String next) {
        boolean valid = switch (current) {
            case "PENDING"    -> "PICKED_UP".equals(next);
            case "PICKED_UP"  -> "DELIVERING".equals(next);
            case "DELIVERING" -> "DELIVERED".equals(next) || "FAILED".equals(next);
            default -> false;
        };
        if (!valid) throw new RuntimeException(
                "Không thể chuyển từ " + current + " sang " + next);
    }

    private ShipmentResponse toResponse(Shipment s) {
        return ShipmentResponse.builder()
                .shipmentId(s.getShipmentId())
                .orderId(s.getOrder().getOrderId())
                .customerName(s.getOrder().getCustomer().getName())
                .shippingAddress(s.getShippingAddress())
                .shipperUsername(s.getShipper() != null
                        ? s.getShipper().getUsername() : null)
                .status(s.getStatus())
                .trackingNote(s.getTrackingNote())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .deliveredAt(s.getDeliveredAt())
                .build();
    }
}