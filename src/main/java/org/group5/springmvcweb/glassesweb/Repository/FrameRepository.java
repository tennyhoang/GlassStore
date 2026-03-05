package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FrameRepository extends JpaRepository<Frame, Integer> {
}