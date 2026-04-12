package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByFrame_FrameIdOrderByCreatedAtDesc(Integer frameId);

    List<Review> findByReadyMadeGlasses_ProductIdOrderByCreatedAtDesc(Integer productId);

    List<Review> findByCustomer_CustomerIdOrderByCreatedAtDesc(Integer customerId);

    boolean existsByCustomer_CustomerIdAndFrame_FrameId(Integer customerId, Integer frameId);

    boolean existsByCustomer_CustomerIdAndReadyMadeGlasses_ProductId(Integer customerId, Integer productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.frame.frameId = :frameId")
    Double avgRatingByFrameId(Integer frameId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.readyMadeGlasses.productId = :productId")
    Double avgRatingByProductId(Integer productId);
}