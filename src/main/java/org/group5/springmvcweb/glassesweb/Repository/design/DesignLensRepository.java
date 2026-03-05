package org.group5.springmvcweb.glassesweb.Repository.design;

import org.group5.springmvcweb.glassesweb.Entity.design.DesignLens;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignLensRepository extends JpaRepository<DesignLens, Integer> {
    List<DesignLens> findByDesignId(Integer designId);
}