package org.group5.springmvcweb.glassesweb.DTO;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO bọc kết quả pagination để trả về client.
 *
 * Response format:
 * {
 *   "content":       [...],   // dữ liệu trang hiện tại
 *   "page":          0,       // trang hiện tại (0-based)
 *   "size":          20,      // số item mỗi trang
 *   "totalElements": 150,     // tổng số item
 *   "totalPages":    8,       // tổng số trang
 *   "first":         true,    // có phải trang đầu không
 *   "last":          false    // có phải trang cuối không
 * }
 *
 * Cách dùng trong Service:
 *   Page<Frame> page = frameRepository.findAll(pageable);
 *   return PageResponse.of(page.map(this::toFrameResponse));
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;
    private int     page;
    private int     size;
    private long    totalElements;
    private int     totalPages;
    private boolean first;
    private boolean last;

    /**
     * Factory method — convert từ Spring Page sang PageResponse.
     *
     * @param page Spring Data Page object
     * @return PageResponse với đầy đủ metadata
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
