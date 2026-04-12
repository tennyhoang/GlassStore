package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.PrescriptionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionFileRepository extends JpaRepository<PrescriptionFile, Integer> {

    List<PrescriptionFile> findByEyeProfile_EyeProfileId(Integer eyeProfileId);
}