package org.group5.springmvcweb.glassesweb.Repository.eye;

import java.util.List;

import org.group5.springmvcweb.glassesweb.Entity.eye.EyePrescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface  EyePrescriptionRepository extends JpaRepository<EyePrescription, Integer> {
    List<EyePrescription> findByEyeProfileId(Integer eyeProfileId);
}
