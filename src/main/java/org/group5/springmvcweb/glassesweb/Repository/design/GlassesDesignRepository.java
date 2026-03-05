package org.group5.springmvcweb.glassesweb.Repository.design;

import org.group5.springmvcweb.glassesweb.Entity.design.GlassesDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlassesDesignRepository extends JpaRepository<GlassesDesign, Integer> {
}