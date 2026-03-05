package org.group5.springmvcweb.glassesweb.Service.eye;

import org.group5.springmvcweb.glassesweb.Entity.eye.EyeProfile;
import org.group5.springmvcweb.glassesweb.Repository.eye.EyeProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EyeProfileServiceImpl implements EyeProfileService {

    @Autowired
    private EyeProfileRepository repository;

    @Override
    public EyeProfile createEyeProfile(EyeProfile eyeProfile, Integer currentCustomerId) {
        eyeProfile.setCustomerId(currentCustomerId);
        eyeProfile.setStatus("ACTIVE");
        return repository.save(eyeProfile);
    }

    @Override
    public List<EyeProfile> getAllByCustomer(Integer customerId) {
        return /*(List<EyeProfile>)*/ repository.findByCustomerId(customerId);
    }

    @Override
    public EyeProfile getById(Integer eyeProfileId, Integer customerId) {
        EyeProfile profile = (EyeProfile) repository.findById(eyeProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy EyeProfile"));
        if (!profile.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Profile này không thuộc về bạn");
        }
        return profile;
    }

    @Override
    public EyeProfile update(Integer eyeProfileId, EyeProfile updated, Integer customerId) {
        EyeProfile existing = getById(eyeProfileId, customerId);
        if (updated.getSource() != null) existing.setSource(updated.getSource());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    @Override
    public void delete(Integer eyeProfileId, Integer customerId) {
        EyeProfile profile = getById(eyeProfileId, customerId);
        repository.delete(profile);
    }
}