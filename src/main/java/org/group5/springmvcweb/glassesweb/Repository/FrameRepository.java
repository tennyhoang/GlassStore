package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FrameRepository extends JpaRepository<Frame, Integer> {

    // ── Queries cu — giu nguyen ─────────────────────────────────────────────
    List<Frame> findByStatus(String status);
    List<Frame> findByStatusIn(List<String> statuses);
    List<Frame> findByBrandAndStatus(String brand, String status);
    List<Frame> findByStatusOrderByPriceAsc(String status);

    // ── Pagination don gian ────────────────────────────────────────────────
    Page<Frame> findByStatusIn(List<String> statuses, Pageable pageable);

    /**
     * Tim kiem frame theo ten hoac thuong hieu + phan trang.
     */
    @Query("SELECT f FROM Frame f WHERE f.status IN :statuses AND " +
            "(LOWER(f.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            " LOWER(f.brand) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Frame> searchByNameOrBrand(
            @Param("q")        String q,
            @Param("statuses") List<String> statuses,
            Pageable pageable);

    /**
     * Filter nang cao: brand + material + color + shape + price range + phan trang.
     *
     * Tat ca param deu optional — null = bo qua dieu kien do.
     * Them shape, material, color so voi phien ban cu.
     *
     * Dung trong: GET /api/frames/paged?brand=Ray-Ban&shape=Oval&minPrice=500000
     */
    @Query("SELECT f FROM Frame f WHERE f.status IN :statuses " +
            "AND (:brand    IS NULL OR f.brand    = :brand) " +
            "AND (:material IS NULL OR f.material = :material) " +
            "AND (:color    IS NULL OR f.color    = :color) " +
            "AND (:shape    IS NULL OR f.shape    = :shape) " +
            "AND (:minPrice IS NULL OR f.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR f.price <= :maxPrice) " +
            "AND (:keyword  IS NULL OR :keyword = '' OR " +
            "     LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(f.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Frame> findByFilters(
            @Param("statuses") List<String> statuses,
            @Param("brand")    String brand,
            @Param("material") String material,
            @Param("color")    String color,
            @Param("shape")    String shape,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword")  String keyword,
            Pageable pageable);

    /**
     * Lay danh sach distinct brand dang co san pham.
     * Dung cho dropdown filter ben frontend.
     */
    @Query("SELECT DISTINCT f.brand FROM Frame f WHERE f.status IN :statuses AND f.brand IS NOT NULL ORDER BY f.brand")
    List<String> findDistinctBrands(@Param("statuses") List<String> statuses);

    /**
     * Lay danh sach distinct shape dang co san pham.
     */
    @Query("SELECT DISTINCT f.shape FROM Frame f WHERE f.status IN :statuses AND f.shape IS NOT NULL ORDER BY f.shape")
    List<String> findDistinctShapes(@Param("statuses") List<String> statuses);

    /**
     * Lay danh sach distinct material dang co san pham.
     */
    @Query("SELECT DISTINCT f.material FROM Frame f WHERE f.status IN :statuses AND f.material IS NOT NULL ORDER BY f.material")
    List<String> findDistinctMaterials(@Param("statuses") List<String> statuses);

    /**
     * Lay danh sach distinct color dang co san pham.
     */
    @Query("SELECT DISTINCT f.color FROM Frame f WHERE f.status IN :statuses AND f.color IS NOT NULL ORDER BY f.color")
    List<String> findDistinctColors(@Param("statuses") List<String> statuses);
}