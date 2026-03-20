package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FrameRepository extends JpaRepository<Frame, Integer> {
    List<Frame> findByStatus(String status);
    List<Frame> findByStatusIn(List<String> statuses);
    List<Frame> findByBrandAndStatus(String brand, String status);
    List<Frame> findByStatusOrderByPriceAsc(String status);
}