package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.Entity.Notification;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AccountRepository      accountRepository;

    public void notify(Integer accountId, String title, String message,
                       String type, Integer referenceId) {
        accountRepository.findById(accountId).ifPresent(account -> {
            Notification n = new Notification();
            n.setAccount(account);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            n.setReferenceId(referenceId);
            n.setRead(false);
            notificationRepository.save(n);
        });
    }

    public void notifyOrderStatus(Integer accountId, Integer orderId, String status) {
        String msg = switch (status) {
            case "CONFIRMED"     -> "Đơn hàng #" + orderId + " đã được xác nhận.";
            case "MANUFACTURING" -> "Đơn hàng #" + orderId + " đang được sản xuất.";
            case "SHIPPING"      -> "Đơn hàng #" + orderId + " đang được giao đến bạn!";
            case "DELIVERED"     -> "Đơn hàng #" + orderId + " đã giao thành công. Cảm ơn bạn!";
            case "CANCELLED"     -> "Đơn hàng #" + orderId + " đã bị huỷ.";
            default -> "Đơn hàng #" + orderId + " cập nhật trạng thái: " + status;
        };
        notify(accountId, "Cập nhật đơn hàng", msg, "ORDER_UPDATE", orderId);
    }

    public void notifyReturnStatus(Integer accountId, Integer returnId, String status) {
        String msg = switch (status) {
            case "APPROVED"  -> "Yêu cầu đổi/trả #" + returnId + " đã được duyệt.";
            case "REJECTED"  -> "Yêu cầu đổi/trả #" + returnId + " đã bị từ chối.";
            case "COMPLETED" -> "Yêu cầu đổi/trả #" + returnId + " đã hoàn tất xử lý.";
            default -> "Yêu cầu đổi/trả #" + returnId + " cập nhật: " + status;
        };
        notify(accountId, "Cập nhật đổi/trả", msg, "RETURN_UPDATE", returnId);
    }
}