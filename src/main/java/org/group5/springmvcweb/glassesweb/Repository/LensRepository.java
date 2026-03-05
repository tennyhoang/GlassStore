package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Lens;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LensRepository extends JpaRepository<Lens, Integer> {
}