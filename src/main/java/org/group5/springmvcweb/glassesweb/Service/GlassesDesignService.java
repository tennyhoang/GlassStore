package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.group5.springmvcweb.glassesweb.security.EyeProfileAccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GlassesDesignService {

    private final GlassesDesignRepository designRepository;
    private final GlassesDesignOptionRepository designOptionRepository;
    private final MyGlassesRepository myGlassesRepository;
    private final CustomerRepository customerRepository;
    private final EyeProfileRepository eyeProfileRepository;
    private final FrameRepository frameRepository;
    private final LensRepository lensRepository;
    private final LensOptionRepository lensOptionRepository;

    // =============================================
    // CUSTOMER: Tạo bản thiết kế kính mới
    // =============================================
    @Transactional
    public GlassesDesignResponse createDesign(Integer customerId,
                                              GlassesDesignRequest request) {
        // Load các entity cần thiết
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        EyeProfile eyeProfile = eyeProfileRepository.findById(request.getEyeProfileId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ mắt"));

        // Kiểm tra hồ sơ mắt thuộc về customer này
        if (!eyeProfile.getCustomer().getCustomerId().equals(customerId)) {
            throw new EyeProfileAccessDeniedException();
        }

        Frame frame = frameRepository.findById(request.getFrameId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính"));

        Lens lens = lensRepository.findById(request.getLensId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính"));

        // Tính tổng giá: frame + lens + options
        BigDecimal totalPrice = frame.getPrice().add(lens.getPrice());

        // Tạo design trước để có designId
        GlassesDesign design = GlassesDesign.builder()
                .customer(customer)
                .eyeProfile(eyeProfile)
                .frame(frame)
                .lens(lens)
                .designName(request.getDesignName())
                .status("DRAFT")
                .build();
        design = designRepository.save(design);

        // Lưu các LensOption được chọn
        List<GlassesDesignOption> savedOptions = new ArrayList<>();
        if (request.getSelectedOptionIds() != null) {
            for (Integer optionId : request.getSelectedOptionIds()) {
                LensOption option = lensOptionRepository.findById(optionId)
                        .orElseThrow(() -> new RuntimeException(
                                "Không tìm thấy tùy chọn ID: " + optionId));
                totalPrice = totalPrice.add(option.getExtraPrice());

                GlassesDesignOption designOption = GlassesDesignOption.builder()
                        .glassesDesign(design)
                        .optionId(optionId)
                        .optionName(option.getOptionName())   // snapshot
                        .extraPrice(option.getExtraPrice())   // snapshot
                        .build();
                savedOptions.add(designOptionRepository.save(designOption));
            }
        }

        // Cập nhật tổng giá
        design.setTotalPrice(totalPrice);
        design = designRepository.save(design);

        return toDesignResponse(design, savedOptions);
    }

    // =============================================
    // CUSTOMER: Xem danh sách design của mình
    // =============================================
    @Transactional(readOnly = true)
    public List<GlassesDesignResponse> getMyDesigns(Integer customerId) {
        return designRepository
                .findByCustomer_CustomerIdOrderByCreatedDateDesc(customerId)
                .stream()
                .map(d -> toDesignResponse(d,
                        designOptionRepository.findByGlassesDesign_DesignId(d.getDesignId())))
                .collect(Collectors.toList());
    }

    // =============================================
    // CUSTOMER: Xem chi tiết 1 design
    // =============================================
    @Transactional(readOnly = true)
    public GlassesDesignResponse getDesignDetail(Integer customerId, Integer designId) {
        if (!designRepository.existsByDesignIdAndCustomer_CustomerId(designId, customerId)) {
            throw new EyeProfileAccessDeniedException();
        }
        GlassesDesign design = designRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy design ID: " + designId));
        List<GlassesDesignOption> options =
                designOptionRepository.findByGlassesDesign_DesignId(designId);
        return toDesignResponse(design, options);
    }

    // =============================================
    // CUSTOMER: Xoá design (chỉ DRAFT mới xoá được)
    // =============================================
    @Transactional
    public void deleteDesign(Integer customerId, Integer designId) {
        if (!designRepository.existsByDesignIdAndCustomer_CustomerId(designId, customerId)) {
            throw new EyeProfileAccessDeniedException();
        }
        GlassesDesign design = designRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy design ID: " + designId));
        if (!"DRAFT".equals(design.getStatus())) {
            throw new RuntimeException("Chỉ có thể xóa design ở trạng thái DRAFT");
        }
        designRepository.delete(design);
    }

    // =============================================
    // CUSTOMER: Xem danh sách MyGlasses (kính đã nhận)
    // =============================================
    @Transactional(readOnly = true)
    public List<MyGlassesResponse> getMyGlasses(Integer customerId) {
        return myGlassesRepository
                .findByCustomer_CustomerIdOrderByReceivedDateDesc(customerId)
                .stream()
                .map(this::toMyGlassesResponse)
                .collect(Collectors.toList());
    }

    // =============================================
    // INTERNAL: Đánh dấu design là ORDERED (gọi từ OrderService)
    // =============================================
    @Transactional
    public void markDesignAsOrdered(Integer designId) {
        GlassesDesign design = designRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy design ID: " + designId));
        design.setStatus("ORDERED");
        designRepository.save(design);
    }

    // =============================================
    // INTERNAL: Tạo MyGlasses khi order DELIVERED (gọi từ OrderService)
    // =============================================
    @Transactional
    public void createMyGlasses(Integer customerId, Integer designId, Integer orderId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        GlassesDesign design = designRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy design"));

        MyGlasses myGlasses = MyGlasses.builder()
                .customer(customer)
                .glassesDesign(design)
                .orderId(orderId)
                .receivedDate(java.time.LocalDateTime.now())
                .build();
        myGlassesRepository.save(myGlasses);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================
    private GlassesDesignResponse toDesignResponse(GlassesDesign d,
                                                   List<GlassesDesignOption> options) {
        List<GlassesDesignOptionResponse> optionResponses = options == null
                ? List.of()
                : options.stream()
                .map(o -> GlassesDesignOptionResponse.builder()
                        .designOptionId(o.getDesignOptionId())
                        .optionId(o.getOptionId())
                        .optionName(o.getOptionName())
                        .extraPrice(o.getExtraPrice())
                        .build())
                .collect(Collectors.toList());

        return GlassesDesignResponse.builder()
                .designId(d.getDesignId())
                .customerId(d.getCustomer().getCustomerId())
                .customerName(d.getCustomer().getName())
                .eyeProfileId(d.getEyeProfile().getEyeProfileId())
                .frameId(d.getFrame().getFrameId())
                .frameName(d.getFrame().getName())
                .frameBrand(d.getFrame().getBrand())
                .frameColor(d.getFrame().getColor())
                .framePrice(d.getFrame().getPrice())
                .lensId(d.getLens().getLensId())
                .lensName(d.getLens().getName())
                .lensType(d.getLens().getLensType())
                .lensPrice(d.getLens().getPrice())
                .selectedOptions(optionResponses)
                .totalPrice(d.getTotalPrice())
                .designName(d.getDesignName())
                .status(d.getStatus())
                .createdDate(d.getCreatedDate())
                .build();
    }

    private MyGlassesResponse toMyGlassesResponse(MyGlasses mg) {
        GlassesDesignResponse designResponse = null;
        if (mg.getGlassesDesign() != null) {
            List<GlassesDesignOption> options = designOptionRepository
                    .findByGlassesDesign_DesignId(mg.getGlassesDesign().getDesignId());
            designResponse = toDesignResponse(mg.getGlassesDesign(), options);
        }
        return MyGlassesResponse.builder()
                .myGlassesId(mg.getMyGlassesId())
                .customerId(mg.getCustomer().getCustomerId())
                .orderId(mg.getOrderId())
                .design(designResponse)
                .receivedDate(mg.getReceivedDate())
                .notes(mg.getNotes())
                .build();
    }
}