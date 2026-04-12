package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.EyePrescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EyePrescriptionRepository extends JpaRepository<EyePrescription, Integer> {

    List<EyePrescription> findByEyeProfile_EyeProfileId(Integer eyeProfileId);

    void deleteByEyeProfile_EyeProfileId(Integer eyeProfileId);
}