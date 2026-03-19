package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.LensOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LensOptionRepository extends JpaRepository<LensOption, Integer> {

    List<LensOption> findByLens_LensId(Integer lensId);
}