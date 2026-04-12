package org.group5.springmvcweb.glassesweb.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.group5.springmvcweb.glassesweb.DTO.OrderResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * EmailService — gui email HTML dep cho khach hang.
 *
 * Cac su kien gui email:
 *   - DAT HANG THANH CONG  : xac nhan don + danh sach san pham
 *   - XAC NHAN DON HANG    : staff da xac nhan, bat dau xu ly
 *   - DANG SAN XUAT        : xuong dang gia cong kinh
 *   - DANG GIAO HANG       : shipper da lay hang
 *   - GIAO HANG THANH CONG : cam on, moi review
 *   - HUY DON HANG         : thong bao huy
 *   - THANH TOAN VNPAY     : xac nhan thanh toan
 *
 * Tat ca email deu gui ASYNC (@Async) — khong lam cham API response.
 * Neu gui that bai → chi log warning, KHONG throw exception (fail-safe).
 *
 * Bat/tat bang property: app.mail.enabled=true|false
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name:GlassStore}")
    private String fromName;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    // ── Public API ────────────────────────────────────────────────────────────

    /** Gui email xac nhan sau khi dat hang thanh cong */
    @Async
    public void sendOrderConfirmation(OrderResponse order, String toEmail) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Xac nhan don hang #%d", order.getOrderId());
        String body = buildOrderEmail(order,
                "Don hang da duoc dat thanh cong!",
                "#16A34A",
                "Cam on ban da tin tuong GlassStore. Don hang cua ban dang cho nhan vien xac nhan.",
                "Xem don hang",
                "http://localhost:5173/orders"
        );
        send(toEmail, subject, body);
    }

    /** Gui email khi staff xac nhan don */
    @Async
    public void sendOrderStatusConfirmed(OrderResponse order, String toEmail) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Don hang #%d da duoc xac nhan", order.getOrderId());
        String body = buildOrderEmail(order,
                "Don hang da duoc xac nhan!",
                "#1D4ED8",
                "Nhan vien cua chung toi da xac nhan don hang. Quy trinh san xuat se bat dau ngay.",
                "Xem trang thai",
                "http://localhost:5173/orders"
        );
        send(toEmail, subject, body);
    }

    /** Gui email khi bat dau san xuat */
    @Async
    public void sendOrderManufacturing(OrderResponse order, String toEmail) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Kinh cua ban dang duoc san xuat (#%d)", order.getOrderId());
        String body = buildOrderEmail(order,
                "Kinh dang duoc gia cong!",
                "#7C3AED",
                "Xuong cua chung toi dang chinh xac gia cong kinh theo don ban. Qua trinh thuong mat 3-5 ngay lam viec.",
                "Xem trang thai",
                "http://localhost:5173/orders"
        );
        send(toEmail, subject, body);
    }

    /** Gui email khi bat dau giao hang */
    @Async
    public void sendOrderShipping(OrderResponse order, String toEmail) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Don hang #%d dang tren duong giao", order.getOrderId());
        String body = buildOrderEmail(order,
                "Don hang dang duoc giao!",
                "#0369A1",
                "Shipper dang tren duong giao kinh den ban. Vui long de y dien thoai de nhan hang.",
                "Xem trang thai",
                "http://localhost:5173/orders"
        );
        send(toEmail, subject, body);
    }

    /** Gui email khi giao hang thanh cong */
    @Async
    public void sendOrderDelivered(OrderResponse order, String toEmail) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Da giao hang thanh cong! Don #%d", order.getOrderId());
        String body = buildOrderEmail(order,
                "Giao hang thanh cong!",
                "#16A34A",
                "Ban da nhan duoc kinh. Cam on ban da mua hang tai GlassStore! " +
                        "Neu ban hai long, hay danh gia san pham de giup chung toi phuc vu tot hon nhe.",
                "Danh gia san pham",
                "http://localhost:5173/reviews"
        );
        send(toEmail, subject, body);
    }

    /** Gui email khi huy don hang */
    @Async
    public void sendOrderCancelled(OrderResponse order, String toEmail) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Don hang #%d da bi huy", order.getOrderId());
        String body = buildOrderEmail(order,
                "Don hang da bi huy",
                "#DC2626",
                "Don hang cua ban da bi huy. Neu ban can ho tro hoac co thac mac, " +
                        "vui long lien he chung toi.",
                "Tao don hang moi",
                "http://localhost:5173/shop"
        );
        send(toEmail, subject, body);
    }

    /** Gui email xac nhan thanh toan VNPay thanh cong */
    @Async
    public void sendPaymentSuccess(OrderResponse order, String toEmail, String transactionRef) {
        if (!enabled || toEmail == null) return;
        String subject = String.format("[GlassStore] Xac nhan thanh toan don #%d", order.getOrderId());
        String body = buildPaymentEmail(order, transactionRef);
        send(toEmail, subject, body);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("Email sent to {} — {}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            // Fail-safe: log loi nhung khong throw — khong lam hong luong chinh
            log.warn("Khong gui duoc email den {}: {}", to, e.getMessage());
        }
    }

    private String fmtCurrency(BigDecimal amount) {
        if (amount == null) return "0 VND";
        NumberFormat fmt = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return fmt.format(amount) + " VND";
    }

    private String fmtDate(java.time.LocalDateTime dt) {
        if (dt == null) return "";
        return dt.format(DATE_FMT);
    }

    /**
     * Build HTML email cho cac su kien don hang.
     * Thiet ke don gian, hien thi tot tren ca mobile va desktop.
     */
    private String buildOrderEmail(OrderResponse order, String headline,
                                   String accentColor, String message,
                                   String btnText, String btnUrl) {
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                String name = item.getProductName() != null
                        ? item.getProductName()
                        : (item.getDesignId() != null
                        ? "Kinh thiet ke #" + item.getDesignId()
                        : "San pham #" + item.getReadyMadeGlassesId());
                String typeLabel = "CUSTOM_GLASSES".equals(item.getItemType())
                        ? "Kinh theo don" : "Kinh lam san";

                // Chi tiet gong + trong neu co
                StringBuilder detail = new StringBuilder();
                if (item.getFrameName() != null) detail.append("Gong: ").append(item.getFrameName());
                if (item.getLensName()  != null) {
                    if (detail.length() > 0) detail.append(" &nbsp;·&nbsp; ");
                    detail.append("Trong: ").append(item.getLensName());
                }

                itemsHtml.append(String.format("""
                    <tr>
                      <td style="padding:12px 0;border-bottom:1px solid #F3F4F6;vertical-align:top">
                        <div style="font-weight:600;font-size:14px;color:#111">%s</div>
                        %s
                        <span style="display:inline-block;margin-top:4px;padding:2px 10px;background:#EDE9FE;color:#5B21B6;border-radius:20px;font-size:11px;font-weight:600">%s</span>
                      </td>
                      <td style="padding:12px 0 12px 16px;border-bottom:1px solid #F3F4F6;text-align:right;white-space:nowrap;vertical-align:top">
                        <div style="font-size:13px;color:#6B7280">x%d</div>
                        <div style="font-weight:700;color:#111;margin-top:2px">%s</div>
                      </td>
                    </tr>
                    """,
                        name,
                        detail.length() > 0
                                ? "<div style='font-size:12px;color:#9CA3AF;margin-top:3px'>" + detail + "</div>"
                                : "",
                        typeLabel,
                        item.getQuantity(),
                        fmtCurrency(item.getSubtotal())
                ));
            }
        }

        String discountRow = "";
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discountRow = String.format("""
                <tr>
                  <td style="padding:8px 0;color:#16A34A;font-size:13px">
                    Giam gia%s
                  </td>
                  <td style="padding:8px 0;text-align:right;color:#16A34A;font-size:13px">
                    -%s
                  </td>
                </tr>
                """,
                    order.getDiscountCode() != null ? " (" + order.getDiscountCode() + ")" : "",
                    fmtCurrency(order.getDiscountAmount())
            );
        }

        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <title>GlassStore</title></head>
            <body style="margin:0;padding:0;background:#F9FAFB;font-family:'Segoe UI',Arial,sans-serif">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px">
                <tr><td align="center">
                  <table width="580" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

                    <!-- Header -->
                    <tr>
                      <td style="background:%s;padding:28px 36px;text-align:center">
                        <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px">GlassStore</div>
                        <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px">Kinh mat cao cap</div>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:32px 36px">
                        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">%s</h2>
                        <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6">%s</p>

                        <!-- Order info box -->
                        <div style="background:#F9FAFB;border-radius:12px;padding:16px 20px;margin-bottom:24px">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#9CA3AF;width:50%%">Ma don hang</td>
                              <td style="font-size:13px;font-weight:700;color:#111;text-align:right">#%d</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px;color:#9CA3AF;padding-top:6px">Ngay dat</td>
                              <td style="font-size:13px;color:#374151;text-align:right;padding-top:6px">%s</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px;color:#9CA3AF;padding-top:6px">Dia chi</td>
                              <td style="font-size:13px;color:#374151;text-align:right;padding-top:6px">%s</td>
                            </tr>
                          </table>
                        </div>

                        <!-- Items table -->
                        <div style="margin-bottom:20px">
                          <div style="font-size:12px;font-weight:700;color:#9CA3AF;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px">
                            San pham
                          </div>
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            %s
                          </table>
                        </div>

                        <!-- Totals -->
                        <table width="100%%" cellpadding="0" cellspacing="0"
                               style="border-top:1px solid #F3F4F6;padding-top:12px">
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#6B7280">Tam tinh</td>
                            <td style="padding:6px 0;font-size:13px;text-align:right">%s</td>
                          </tr>
                          %s
                          <tr>
                            <td style="padding:12px 0 0;font-size:16px;font-weight:700;border-top:2px solid #111;color:#111">
                              Tong cong
                            </td>
                            <td style="padding:12px 0 0;font-size:18px;font-weight:800;text-align:right;border-top:2px solid #111;color:%s">
                              %s
                            </td>
                          </tr>
                        </table>

                        <!-- CTA Button -->
                        <div style="text-align:center;margin:28px 0 0">
                          <a href="%s"
                             style="display:inline-block;padding:14px 36px;background:%s;color:#fff;
                                    border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
                            %s
                          </a>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#F9FAFB;padding:20px 36px;text-align:center;
                                 border-top:1px solid #E5E7EB">
                        <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6">
                          GlassStore &nbsp;·&nbsp; Bao hanh 12 thang &nbsp;·&nbsp; Doi tra 30 ngay<br>
                          Email nay duoc gui tu dong, vui long khong reply.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """,
                accentColor,          // header bg
                headline,             // h2
                message,              // paragraph
                order.getOrderId(),   // ma don
                fmtDate(order.getCreatedAt()),
                order.getShippingAddress() != null ? order.getShippingAddress() : "—",
                itemsHtml,
                fmtCurrency(order.getTotalAmount()),
                discountRow,
                accentColor,          // tong cong color
                fmtCurrency(order.getFinalAmount()),
                btnUrl,
                accentColor,          // btn bg
                btnText
        );
    }

    private String buildPaymentEmail(OrderResponse order, String transactionRef) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <title>GlassStore — Xac nhan thanh toan</title></head>
            <body style="margin:0;padding:0;background:#F9FAFB;font-family:'Segoe UI',Arial,sans-serif">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px">
                <tr><td align="center">
                  <table width="580" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
                    <tr>
                      <td style="background:#16A34A;padding:28px 36px;text-align:center">
                        <div style="font-size:40px;margin-bottom:8px">✓</div>
                        <div style="font-size:22px;font-weight:800;color:#fff">Thanh toan thanh cong!</div>
                        <div style="color:rgba(255,255,255,0.85);font-size:14px;margin-top:6px">GlassStore</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 36px">
                        <div style="background:#F0FDF4;border-radius:12px;padding:20px 24px;margin-bottom:24px">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#6B7280">Ma don hang</td>
                              <td style="font-size:14px;font-weight:700;color:#111;text-align:right">#%d</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px;color:#6B7280;padding-top:8px">Ma giao dich</td>
                              <td style="font-size:13px;font-family:monospace;color:#374151;text-align:right;padding-top:8px">%s</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px;color:#6B7280;padding-top:8px">So tien</td>
                              <td style="font-size:18px;font-weight:800;color:#16A34A;text-align:right;padding-top:8px">%s</td>
                            </tr>
                            <tr>
                              <td style="font-size:13px;color:#6B7280;padding-top:8px">Phuong thuc</td>
                              <td style="font-size:13px;color:#374151;text-align:right;padding-top:8px">VNPay</td>
                            </tr>
                          </table>
                        </div>
                        <p style="font-size:14px;color:#6B7280;line-height:1.7;margin:0 0 24px">
                          Don hang cua ban da duoc thanh toan va xac nhan. Chung toi se bat dau san xuat ngay.
                        </p>
                        <div style="text-align:center">
                          <a href="http://localhost:5173/orders"
                             style="display:inline-block;padding:14px 36px;background:#16A34A;color:#fff;
                                    border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
                            Xem don hang
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#F9FAFB;padding:20px 36px;text-align:center;border-top:1px solid #E5E7EB">
                        <p style="margin:0;font-size:12px;color:#9CA3AF">
                          GlassStore &nbsp;·&nbsp; Bao hanh 12 thang &nbsp;·&nbsp; Doi tra 30 ngay
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """,
                order.getOrderId(),
                transactionRef != null ? transactionRef : "N/A",
                fmtCurrency(order.getFinalAmount())
        );
    }
}