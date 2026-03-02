package org.group5.springmvcweb.glassesweb.Repository.eye;

import java.util.List;

import org.group5.springmvcweb.glassesweb.Entity.eye.PrescriptionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionFileRepository extends JpaRepository<PrescriptionFile, Integer> {
    List<PrescriptionFile> findByEyeProfileId(Integer eyeProfileId);
}
