package org.group5.springmvcweb.glassesweb.DTO;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO cho API search don hang cua staff.
 *
 * Tat ca cac truong deu optional — truong nao null thi khong loc theo truong do.
 *
 * sortBy:   orderId | createdAt | finalAmount  (default: createdAt)
 * sortDir:  asc | desc                         (default: desc)
 */
@Getter
@Setter
public class OrderSearchRequest {

    /** Tu khoa tim kiem: ten khach, sdt, email, ma don */
    private String keyword;

    /** Loc theo trang thai: PENDING, CONFIRMED, MANUFACTURING, SHIPPING, DELIVERED, CANCELLED */
    private String status;

    /** Gia tri don hang tu */
    private BigDecimal minAmount;

    /** Gia tri don hang den */
    private BigDecimal maxAmount;

    /** Field sap xep: orderId | createdAt | finalAmount */
    private String sortBy = "createdAt";

    /** Chieu sap xep: asc | desc */
    private String sortDir = "desc";

    /** So trang (0-based) */
    private int page = 0;

    /** So dong moi trang */
    private int size = 20;
}