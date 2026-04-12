package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.GlassesDesignOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GlassesDesignOptionRepository extends JpaRepository<GlassesDesignOption, Integer> {

    List<GlassesDesignOption> findByGlassesDesign_DesignId(Integer designId);
}