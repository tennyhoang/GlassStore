package org.group5.springmvcweb.glassesweb.Repository;

import java.util.List;
import org.group5.springmvcweb.glassesweb.Entity.EyeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface  EyeProfileRepository extends JpaRepository<EyeProfile, Integer> {
    List<EyeProfile> findByCustomerId(Integer customerId);
}
