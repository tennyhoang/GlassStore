package org.group5.springmvcweb.glassesweb.Service;

import java.util.List;

import org.group5.springmvcweb.glassesweb.Entity.EyeProfile;

public interface EyeProfileService {
    EyeProfile createEyeProfile(EyeProfile eyeProfile, Integer customerId);
    List<EyeProfile> getAllByCustomer(Integer customerId);
    EyeProfile getById(Integer eyeProfileId, Integer customerId);
    EyeProfile update(Integer eyeProfileId, EyeProfile updated, Integer customerId);
    void delete(Integer eyeProfileId, Integer customerId);

}
