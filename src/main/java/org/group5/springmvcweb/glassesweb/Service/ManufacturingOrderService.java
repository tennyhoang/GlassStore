package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.ManufacturingOrderResponse;
import org.group5.springmvcweb.glassesweb.DTO.UpdateManufacturingStatusRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateOrderStatusRequest;
import org.group5.springmvcweb.glassesweb.Entity.ManufacturingOrder;
import org.group5.springmvcweb.glassesweb.Entity.Order;
import org.group5.springmvcweb.glassesweb.Repository.ManufacturingOrderRepository;
import org.group5.springmvcweb.glassesweb.Repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ManufacturingOrderService
 *
 * Luồng:
 *   STAFF confirm Order → tạo ManufacturingOrder (PENDING)
 *   OPERATION nhận     → IN_PROGRESS
 *   OPERATION hoàn tất → COMPLETED → Order chuyển sang SHIPPING
 *                                  → tạo Shipment tự động
 */
@Service
@RequiredArgsConstructor
public class ManufacturingOrderService {

    private final ManufacturingOrderRepository manufacturingOrderRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ShipmentService shipmentService;

    // =============================================
    // STAFF: Tạo lệnh sản xuất khi confirm đơn
    // Gọi sau khi Order chuyển sang CONFIRMED
    // =============================================
    @Transactional
    public ManufacturingOrderResponse createManufacturingOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!"CONFIRMED".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ tạo lệnh sản xuất cho đơn hàng đã CONFIRMED");
        }

        // Tránh tạo trùng
        if (manufacturingOrderRepository.findByOrder_OrderId(orderId).isPresent()) {
            throw new RuntimeException("Lệnh sản xuất cho đơn này đã tồn tại");
        }

        ManufacturingOrder mo = ManufacturingOrder.builder()
                .order(order)
                .status("PENDING")
                .build();
        mo = manufacturingOrderRepository.save(mo);

        // Cập nhật Order → MANUFACTURING
        UpdateOrderStatusRequest statusReq = new UpdateOrderStatusRequest("MANUFACTURING");
        orderService.updateOrderStatus(orderId, statusReq);

        return toResponse(mo);
    }

    // =============================================
    // OPERATION: Xem danh sách lệnh sản xuất
    // =============================================
    @Transactional(readOnly = true)
    public List<ManufacturingOrderResponse> getByStatus(String status) {
        return manufacturingOrderRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // OPERATION: Xem chi tiết 1 lệnh
    // =============================================
    @Transactional(readOnly = true)
    public ManufacturingOrderResponse getById(Integer manufacturingId) {
        ManufacturingOrder mo = manufacturingOrderRepository.findById(manufacturingId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy lệnh sản xuất ID: " + manufacturingId));
        return toResponse(mo);
    }

    // =============================================
    // OPERATION: Cập nhật trạng thái sản xuất
    // PENDING → IN_PROGRESS → COMPLETED
    // =============================================
    @Transactional
    public ManufacturingOrderResponse updateStatus(Integer manufacturingId,
                                                   UpdateManufacturingStatusRequest request) {
        ManufacturingOrder mo = manufacturingOrderRepository.findById(manufacturingId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy lệnh sản xuất ID: " + manufacturingId));

        validateStatusTransition(mo.getStatus(), request.getStatus());

        mo.setStatus(request.getStatus());
        if (request.getNotes() != null) mo.setNotes(request.getNotes());

        if ("COMPLETED".equals(request.getStatus())) {
            mo.setCompletedAt(LocalDateTime.now());

            // Order → SHIPPING + tạo Shipment
            Integer orderId = mo.getOrder().getOrderId();
            UpdateOrderStatusRequest statusReq = new UpdateOrderStatusRequest("SHIPPING");
            orderService.updateOrderStatus(orderId, statusReq);
            shipmentService.createShipment(orderId);
        }

        mo = manufacturingOrderRepository.save(mo);
        return toResponse(mo);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private void validateStatusTransition(String current, String next) {
        boolean valid = switch (current) {
            case "PENDING"     -> "IN_PROGRESS".equals(next);
            case "IN_PROGRESS" -> "COMPLETED".equals(next);
            default -> false;
        };
        if (!valid) throw new RuntimeException(
                "Không thể chuyển từ " + current + " sang " + next);
    }

    private ManufacturingOrderResponse toResponse(ManufacturingOrder mo) {
        return ManufacturingOrderResponse.builder()
                .manufacturingId(mo.getManufacturingId())
                .orderId(mo.getOrder().getOrderId())
                .customerName(mo.getOrder().getCustomer().getName())
                .status(mo.getStatus())
                .notes(mo.getNotes())
                .createdAt(mo.getCreatedAt())
                .updatedAt(mo.getUpdatedAt())
                .completedAt(mo.getCompletedAt())
                .build();
    }
}