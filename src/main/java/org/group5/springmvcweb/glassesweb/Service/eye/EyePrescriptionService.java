package org.group5.springmvcweb.glassesweb.Service.eye;

import org.group5.springmvcweb.glassesweb.Entity.eye.EyePrescription;
import org.group5.springmvcweb.glassesweb.Entity.eye.PrescriptionFile;

import java.util.List;

public interface EyePrescriptionService {
    EyePrescription createEyePrescription(EyePrescription eyePrescription, Integer eyeProfileId, Integer currentCustomerId);
    EyePrescription updatePrescription(Integer prescriptionId, EyePrescription updated, Integer currentCustomerId);
    List<EyePrescription> getAllByEyeProfile(Integer eyeProfileId, Integer currentCustomerId);
    boolean validatePrescription(Integer eyeProfileId, EyePrescription prescription);
    PrescriptionFile uploadPrescriptionFile(String fileUrl, Integer eyeProfileId, Integer currentCustomerId);
}