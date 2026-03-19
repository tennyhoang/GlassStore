package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.ReadyMadeGlasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadyMadeGlassesRepository extends JpaRepository<ReadyMadeGlasses, Integer> {

    List<ReadyMadeGlasses> findByStatus(String status);
}