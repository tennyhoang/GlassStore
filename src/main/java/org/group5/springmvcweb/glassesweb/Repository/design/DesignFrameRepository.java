package org.group5.springmvcweb.glassesweb.Repository.design;

import org.group5.springmvcweb.glassesweb.Entity.design.DesignFrame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignFrameRepository extends JpaRepository<DesignFrame, Integer> {
    List<DesignFrame> findByDesignId(Integer designId);
}