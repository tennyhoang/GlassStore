package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.MyGlasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MyGlassesRepository extends JpaRepository<MyGlasses, Integer> {

    List<MyGlasses> findByCustomer_CustomerIdOrderByReceivedDateDesc(Integer customerId);
}