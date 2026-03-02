package org.group5.springmvcweb.glassesweb.Service.eye;

import org.group5.springmvcweb.glassesweb.Entity.eye.EyePrescription;
import org.group5.springmvcweb.glassesweb.Entity.eye.PrescriptionFile;
import org.group5.springmvcweb.glassesweb.Entity.eye.EyeProfile;
import org.group5.springmvcweb.glassesweb.Repository.eye.EyePrescriptionRepository;
import org.group5.springmvcweb.glassesweb.Repository.eye.PrescriptionFileRepository;
import org.group5.springmvcweb.glassesweb.Repository.eye.EyeProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EyePrescriptionServiceImpl implements EyePrescriptionService {

    @Autowired
    private EyePrescriptionRepository prescriptionRepository;

    @Autowired
    private EyeProfileRepository eyeProfileRepository;

    @Autowired
    private PrescriptionFileRepository fileRepository;

    @Override
    public EyePrescription createEyePrescription(EyePrescription eyePrescription, Integer eyeProfileId, Integer currentCustomerId) {
        EyeProfile profile = (EyeProfile) eyeProfileRepository.findById(eyeProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy EyeProfile"));
        if (!profile.getCustomerId().equals(currentCustomerId)) {
            throw new RuntimeException("Profile này không thuộc về bạn");
        }

        eyePrescription.setEyeProfileId(eyeProfileId);
        return prescriptionRepository.save(eyePrescription);
    }

    @Override
    public EyePrescription updatePrescription(Integer prescriptionId, EyePrescription updated, Integer currentCustomerId) {
        EyePrescription existing = (EyePrescription) prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Prescription"));
        EyeProfile profile = (EyeProfile) eyeProfileRepository.findById(existing.getEyeProfileId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy EyeProfile"));
        if (!profile.getCustomerId().equals(currentCustomerId)) {
            throw new RuntimeException("Bạn không sở hữu prescription này");
        }

        if (updated.getEyeSide() != null) existing.setEyeSide(updated.getEyeSide());
        existing.setSph(updated.getSph());
        existing.setCyl(updated.getCyl());
        if (updated.getAxis() != null) existing.setAxis(updated.getAxis());
        existing.setPd(updated.getPd());
        existing.setAdd(updated.getAdd());

        return prescriptionRepository.save(existing);
    }

    @Override
    public List<EyePrescription> getAllByEyeProfile(Integer eyeProfileId, Integer currentCustomerId) {
        EyeProfile profile = (EyeProfile) eyeProfileRepository.findById(eyeProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy EyeProfile"));
        if (!profile.getCustomerId().equals(currentCustomerId)) {
            throw new RuntimeException("Bạn không sở hữu profile này");
        }
        return prescriptionRepository.findByEyeProfileId(eyeProfileId);
    }

    @Override
    public boolean validatePrescription(Integer eyeProfileId, EyePrescription prescription) {
        EyeProfile profile = (EyeProfile) eyeProfileRepository.findById(eyeProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy EyeProfile"));
        // Không cần currentCustomerId trong validate (có thể bỏ nếu không dùng)
        // if (!profile.getCustomerId().equals(currentCustomerId)) { ... }

        if (prescription.getEyeSide() == null || prescription.getEyeSide().isEmpty()) {
            return false;
        }
        if (prescription.getSph() < -20 || prescription.getSph() > 20) return false;
        if (prescription.getCyl() < -6 || prescription.getCyl() > 6) return false;
        if (prescription.getAxis() != null && (prescription.getAxis() < 0 || prescription.getAxis() > 180)) return false;
        return true;
    }

    @Override
    public PrescriptionFile uploadPrescriptionFile(String fileUrl, Integer eyeProfileId, Integer currentCustomerId) {
        EyeProfile profile = (EyeProfile) eyeProfileRepository.findById(eyeProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy EyeProfile"));
        if (!profile.getCustomerId().equals(currentCustomerId)) {
            throw new RuntimeException("Bạn không sở hữu profile này");
        }

        PrescriptionFile file = new PrescriptionFile();
        file.setEyeProfileId(eyeProfileId);
        file.setFileUrl(fileUrl);
        return fileRepository.save(file);
    }
}