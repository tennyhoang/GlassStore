package org.group5.springmvcweb.glassesweb.Controller;

import lombok.*;
import org.group5.springmvcweb.glassesweb.DTO.ApiResponse;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository           reviewRepository;
    private final CustomerRepository         customerRepository;
    private final FrameRepository            frameRepository;
    private final ReadyMadeGlassesRepository readyMadeRepository;

    @GetMapping("/frames/{frameId}")
    public ResponseEntity<ApiResponse<ReviewListResponse>> getFrameReviews(
            @PathVariable Integer frameId) {
        List<ReviewResponse> list = reviewRepository
                .findByFrame_FrameIdOrderByCreatedAtDesc(frameId)
                .stream().map(this::toResponse).collect(Collectors.toList());
        Double avg = reviewRepository.avgRatingByFrameId(frameId);
        return ResponseEntity.ok(ApiResponse.ok(
                new ReviewListResponse(list, avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0, list.size())));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<ReviewListResponse>> getProductReviews(
            @PathVariable Integer productId) {
        List<ReviewResponse> list = reviewRepository
                .findByReadyMadeGlasses_ProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
        Double avg = reviewRepository.avgRatingByProductId(productId);
        return ResponseEntity.ok(ApiResponse.ok(
                new ReviewListResponse(list, avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0, list.size())));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal user) {
        List<ReviewResponse> list = reviewRepository
                .findByCustomer_CustomerIdOrderByCreatedAtDesc(user.getCustomerId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CreateReviewRequest req) {

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5)
            return ResponseEntity.badRequest().body(ApiResponse.fail("Rating phải từ 1-5 sao"));

        if (req.getFrameId() == null && req.getProductId() == null)
            return ResponseEntity.badRequest().body(ApiResponse.fail("Vui lòng chọn sản phẩm cần đánh giá"));

        Customer customer = customerRepository.findById(user.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Review review = new Review();
        review.setCustomer(customer);
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review.setCreatedAt(LocalDateTime.now());

        if (req.getFrameId() != null) {
            if (reviewRepository.existsByCustomer_CustomerIdAndFrame_FrameId(user.getCustomerId(), req.getFrameId()))
                return ResponseEntity.badRequest().body(ApiResponse.fail("Bạn đã đánh giá gọng kính này rồi"));
            Frame frame = frameRepository.findById(req.getFrameId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính"));
            review.setFrame(frame);
        }

        if (req.getProductId() != null) {
            if (reviewRepository.existsByCustomer_CustomerIdAndReadyMadeGlasses_ProductId(user.getCustomerId(), req.getProductId()))
                return ResponseEntity.badRequest().body(ApiResponse.fail("Bạn đã đánh giá sản phẩm này rồi"));
            ReadyMadeGlasses product = readyMadeRepository.findById(req.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            review.setReadyMadeGlasses(product);
        }

        reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đánh giá thành công!", toResponse(review)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Integer id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));
        if (!review.getCustomer().getCustomerId().equals(user.getCustomerId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.fail("Bạn không có quyền xoá đánh giá này"));
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá đánh giá", null));
    }

    private ReviewResponse toResponse(Review r) {
        String productName = null, productType = null;
        if (r.getFrame() != null) {
            productName = r.getFrame().getName();
            productType = "FRAME";
        } else if (r.getReadyMadeGlasses() != null) {
            productName = r.getReadyMadeGlasses().getName();
            productType = "READY_MADE";
        }
        return new ReviewResponse(
                r.getReviewId(),
                r.getCustomer().getName(),
                r.getCustomer().getCustomerId(),
                r.getRating(), r.getComment(),
                productName, productType,
                r.getFrame() != null ? r.getFrame().getFrameId() : null,
                r.getReadyMadeGlasses() != null ? r.getReadyMadeGlasses().getProductId() : null,
                r.getCreatedAt()
        );
    }

    @Getter @Setter @NoArgsConstructor
    public static class CreateReviewRequest {
        private Integer frameId;
        private Integer productId;
        private Integer rating;
        private String  comment;
    }

    @Getter @AllArgsConstructor
    public static class ReviewResponse {
        private Integer       reviewId;
        private String        customerName;
        private Integer       customerId;
        private Integer       rating;
        private String        comment;
        private String        productName;
        private String        productType;
        private Integer       frameId;
        private Integer       productId;
        private LocalDateTime createdAt;
    }

    @Getter @AllArgsConstructor
    public static class ReviewListResponse {
        private List<ReviewResponse> reviews;
        private Double  avgRating;
        private Integer totalCount;
    }
}