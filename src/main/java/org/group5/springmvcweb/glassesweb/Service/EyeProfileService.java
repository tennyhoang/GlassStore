package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.security.EyeProfileAccessDeniedException;
import org.group5.springmvcweb.glassesweb.security.EyeProfileNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EyeProfileService {

    private final EyeProfileRepository eyeProfileRepository;
    private final EyePrescriptionRepository eyePrescriptionRepository;
    private final PrescriptionFileRepository prescriptionFileRepository;
    private final CustomerRepository customerRepository;

    // Thư mục lưu file upload — có thể đổi thành Cloud Storage sau
    private static final String UPLOAD_DIR = System.getProperty("user.home") + "/glassstore-uploads/prescriptions/";

    // =============================================
    // CUSTOMER: Tạo hồ sơ mắt nhập tay
    // =============================================
    @Transactional
    public EyeProfileResponse createManual(Integer customerId,
                                           EyeProfileManualRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        EyeProfile profile = EyeProfile.builder()
                .customer(customer)
                .profileName(request.getProfileName())
                .source(EyeProfile.EyeProfileSource.MANUAL)
                .status(EyeProfile.EyeProfileStatus.ACTIVE)
                .build();
        profile = eyeProfileRepository.save(profile);

        savePrescription(profile, request.getRightEye());
        savePrescription(profile, request.getLeftEye());

        // Reload để lấy đầy đủ prescriptions/files
        return toResponse(eyeProfileRepository.findById(profile.getEyeProfileId()).get());
    }

    // =============================================
    // CUSTOMER: Tạo hồ sơ mắt bằng upload file ảnh/pdf
    //
    // Nhận MultipartFile thực (.jpg, .png, .pdf)
    // Lưu file vào thư mục UPLOAD_DIR
    // Lưu đường dẫn vào PrescriptionFile
    // =============================================
    @Transactional
    public EyeProfileResponse createByUpload(Integer customerId,
                                             String profileName,
                                             MultipartFile file) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        // Lưu file vật lý, lấy về đường dẫn tương đối
        String fileUrl = saveFile(file);

        EyeProfile profile = EyeProfile.builder()
                .customer(customer)
                .profileName(profileName)
                .source(EyeProfile.EyeProfileSource.UPLOADED)
                .status(EyeProfile.EyeProfileStatus.ACTIVE)
                .build();
        profile = eyeProfileRepository.save(profile);

        PrescriptionFile prescriptionFile = PrescriptionFile.builder()
                .eyeProfile(profile)
                .fileUrl(fileUrl)
                .build();
        prescriptionFileRepository.save(prescriptionFile);

        // Reload để lấy đầy đủ files
        return toResponse(eyeProfileRepository.findById(profile.getEyeProfileId()).get());
    }

    // =============================================
    // CUSTOMER: Xem danh sách hồ sơ mắt của mình
    // =============================================
    @Transactional(readOnly = true)
    public List<EyeProfileResponse> getMyProfiles(Integer customerId) {
        return eyeProfileRepository
                .findByCustomer_CustomerIdOrderByCreatedDateDesc(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // CUSTOMER: Xem chi tiết một hồ sơ mắt
    // =============================================
    @Transactional(readOnly = true)
    public EyeProfileResponse getProfileDetail(Integer customerId, Integer eyeProfileId) {
        if (!eyeProfileRepository.existsByEyeProfileIdAndCustomer_CustomerId(
                eyeProfileId, customerId)) {
            throw new EyeProfileAccessDeniedException();
        }
        EyeProfile profile = eyeProfileRepository.findById(eyeProfileId)
                .orElseThrow(() -> new EyeProfileNotFoundException(eyeProfileId));
        return toResponse(profile);
    }

    // =============================================
    // CUSTOMER: Vô hiệu hoá hồ sơ mắt
    // =============================================
    @Transactional
    public EyeProfileResponse deactivateProfile(Integer customerId, Integer eyeProfileId) {
        if (!eyeProfileRepository.existsByEyeProfileIdAndCustomer_CustomerId(
                eyeProfileId, customerId)) {
            throw new EyeProfileAccessDeniedException();
        }
        EyeProfile profile = eyeProfileRepository.findById(eyeProfileId)
                .orElseThrow(() -> new EyeProfileNotFoundException(eyeProfileId));

        profile.setStatus(EyeProfile.EyeProfileStatus.INACTIVE);
        eyeProfileRepository.save(profile);

        return toResponse(eyeProfileRepository.findById(eyeProfileId).get());
    }

    // =============================================
    // STAFF / ADMIN: Xem hồ sơ mắt của bất kỳ customer
    // =============================================
    @Transactional(readOnly = true)
    public List<EyeProfileResponse> getProfilesByCustomerId(Integer customerId) {
        return eyeProfileRepository
                .findByCustomer_CustomerIdOrderByCreatedDateDesc(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // INTERNAL: Lấy profile mới nhất (dùng cho GlassesDesign)
    // =============================================
    @Transactional(readOnly = true)
    public EyeProfile getLatestActiveProfile(Integer customerId) {
        List<EyeProfile> results = eyeProfileRepository
                .findLatestActiveByCustomerIdList(customerId, PageRequest.of(0, 1));
        if (results.isEmpty()) {
            throw new RuntimeException(
                    "Khách hàng chưa có hồ sơ mắt. Vui lòng tạo hồ sơ mắt trước khi thiết kế kính.");
        }
        return results.get(0);
    }

    // =============================================
    // PRIVATE: Lưu file vật lý vào UPLOAD_DIR
    //
    // - Tạo thư mục nếu chưa tồn tại
    // - Đặt tên file bằng UUID để tránh trùng lặp
    // - Giữ lại phần extension gốc (.jpg / .png / .pdf)
    // - Trả về đường dẫn tương đối để lưu vào DB
    // =============================================
    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lấy extension từ tên file gốc
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            }

            // Tên file mới = UUID + extension → không bao giờ trùng
            String newFileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFileName);

            file.transferTo(filePath.toFile());

            // Trả về URL tương đối — frontend/nginx serve tĩnh từ đây
            return "/" + UPLOAD_DIR + newFileName;

        } catch (IOException e) {
            throw new RuntimeException("Lưu file thất bại: " + e.getMessage());
        }
    }

    // =============================================
    // PRIVATE: Chuyển EyeProfile entity → Response DTO
    // =============================================
    private EyeProfileResponse toResponse(EyeProfile profile) {
        List<PrescriptionResponse> prescriptions = profile.getPrescriptions() == null
                ? List.of()
                : profile.getPrescriptions().stream()
                .map(p -> PrescriptionResponse.builder()
                        .prescriptionId(p.getPrescriptionId())
                        .eyeSide(p.getEyeSide() != null ? p.getEyeSide().name() : null)
                        .sph(p.getSph())
                        .cyl(p.getCyl())
                        .axis(p.getAxis())
                        .pd(p.getPd())
                        .add(p.getAdd())
                        .build())
                .collect(Collectors.toList());

        List<PrescriptionFileResponse> files = profile.getFiles() == null
                ? List.of()
                : profile.getFiles().stream()
                .map(f -> PrescriptionFileResponse.builder()
                        .fileId(f.getFileId())
                        .fileUrl(f.getFileUrl())
                        .uploadDate(f.getUploadDate())
                        .build())
                .collect(Collectors.toList());

        return EyeProfileResponse.builder()
                .eyeProfileId(profile.getEyeProfileId())
                .customerId(profile.getCustomer().getCustomerId())
                .customerName(profile.getCustomer().getName())
                .profileName(profile.getProfileName())
                .source(profile.getSource() != null ? profile.getSource().name() : null)
                .status(profile.getStatus() != null ? profile.getStatus().name() : null)
                .createdDate(profile.getCreatedDate())
                .prescriptions(prescriptions)
                .files(files)
                .build();
    }

    // =============================================
    // PRIVATE: Tạo và lưu EyePrescription
    // =============================================
    private void savePrescription(EyeProfile profile, PrescriptionRequest req) {
        EyePrescription prescription = EyePrescription.builder()
                .eyeProfile(profile)
                .eyeSide(req.getEyeSide())
                .sph(req.getSph())
                .cyl(req.getCyl())
                .axis(req.getAxis())
                .pd(req.getPd())
                .add(req.getAdd())
                .build();
        eyePrescriptionRepository.save(prescription);
    }
}