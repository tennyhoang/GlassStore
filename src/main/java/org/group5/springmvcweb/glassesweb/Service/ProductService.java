package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final FrameRepository frameRepository;
    private final LensRepository lensRepository;
    private final LensOptionRepository lensOptionRepository;
    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;

    // =============================================
    // FRAME
    // =============================================

    @Transactional(readOnly = true)
    public List<FrameResponse> getAllFrames() {
        return frameRepository.findByStatusIn(List.of("AVAILABLE", "OUT_OF_STOCK"))
                .stream().map(this::toFrameResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FrameResponse getFrameById(Integer frameId) {
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính ID: " + frameId));
        return toFrameResponse(frame);
    }

    @Transactional
    public FrameResponse createFrame(FrameRequest request) {
        Frame frame = Frame.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .color(request.getColor())
                .material(request.getMaterial())
                .shape(request.getShape())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .status("AVAILABLE")
                .build();
        return toFrameResponse(frameRepository.save(frame));
    }

    @Transactional
    public FrameResponse updateFrame(Integer frameId, FrameRequest request) {
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính ID: " + frameId));
        frame.setName(request.getName());
        frame.setBrand(request.getBrand());
        frame.setColor(request.getColor());
        frame.setMaterial(request.getMaterial());
        frame.setShape(request.getShape());
        frame.setPrice(request.getPrice());
        frame.setStockQuantity(request.getStockQuantity());
        frame.setImageUrl(request.getImageUrl());
        return toFrameResponse(frameRepository.save(frame));
    }

    @Transactional
    public void deleteFrame(Integer frameId) {
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính ID: " + frameId));
        frame.setStatus("DISCONTINUED");
        frameRepository.save(frame);
    }

    // =============================================
    // LENS
    // =============================================

    @Transactional(readOnly = true)
    public List<LensResponse> getAllLenses() {
        return lensRepository.findByStatus("AVAILABLE")
                .stream().map(this::toLensResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LensResponse getLensById(Integer lensId) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính ID: " + lensId));
        return toLensResponse(lens);
    }

    @Transactional
    public LensResponse createLens(LensRequest request) {
        Lens lens = Lens.builder()
                .name(request.getName())
                .lensType(request.getLensType())
                .material(request.getMaterial())
                .indexValue(request.getIndexValue())
                .price(request.getPrice())
                .status("AVAILABLE")
                .build();
        return toLensResponse(lensRepository.save(lens));
    }

    @Transactional
    public LensResponse updateLens(Integer lensId, LensRequest request) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính ID: " + lensId));
        lens.setName(request.getName());
        lens.setLensType(request.getLensType());
        lens.setMaterial(request.getMaterial());
        lens.setIndexValue(request.getIndexValue());
        lens.setPrice(request.getPrice());
        return toLensResponse(lensRepository.save(lens));
    }

    @Transactional
    public void deleteLens(Integer lensId) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính ID: " + lensId));
        lens.setStatus("DISCONTINUED");
        lensRepository.save(lens);
    }

    @Transactional
    public LensOptionResponse addLensOption(Integer lensId, LensOptionRequest request) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính ID: " + lensId));
        LensOption option = LensOption.builder()
                .lens(lens)
                .optionName(request.getOptionName())
                .extraPrice(request.getExtraPrice())
                .build();
        option = lensOptionRepository.save(option);
        return toLensOptionResponse(option);
    }

    @Transactional
    public void deleteLensOption(Integer optionId) {
        lensOptionRepository.deleteById(optionId);
    }

    // =============================================
    // READY MADE GLASSES
    // =============================================

    @Transactional(readOnly = true)
    public List<ReadyMadeGlassesResponse> getAllReadyMadeGlasses() {
        return readyMadeGlassesRepository.findByStatus("AVAILABLE")
                .stream().map(this::toReadyMadeGlassesResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReadyMadeGlassesResponse getReadyMadeGlassesById(Integer productId) {
        ReadyMadeGlasses product = readyMadeGlassesRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));
        return toReadyMadeGlassesResponse(product);
    }

    @Transactional
    public ReadyMadeGlassesResponse createReadyMadeGlasses(ReadyMadeGlassesRequest request) {
        ReadyMadeGlasses product = ReadyMadeGlasses.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .status("AVAILABLE")
                .build();
        return toReadyMadeGlassesResponse(readyMadeGlassesRepository.save(product));
    }

    @Transactional
    public ReadyMadeGlassesResponse updateReadyMadeGlasses(Integer productId,
                                                           ReadyMadeGlassesRequest request) {
        ReadyMadeGlasses product = readyMadeGlassesRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setDescription(request.getDescription());
        return toReadyMadeGlassesResponse(readyMadeGlassesRepository.save(product));
    }

    @Transactional
    public void deleteReadyMadeGlasses(Integer productId) {
        ReadyMadeGlasses product = readyMadeGlassesRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));
        product.setStatus("DISCONTINUED");
        readyMadeGlassesRepository.save(product);
    }

    // =============================================
    // PRIVATE HELPERS
    // =============================================

    private FrameResponse toFrameResponse(Frame f) {
        return FrameResponse.builder()
                .frameId(f.getFrameId())
                .name(f.getName())
                .brand(f.getBrand())
                .color(f.getColor())
                .material(f.getMaterial())
                .shape(f.getShape())
                .price(f.getPrice())
                .stockQuantity(f.getStockQuantity())
                .imageUrl(f.getImageUrl())
                .status(f.getStatus())
                .build();
    }

    private LensOptionResponse toLensOptionResponse(LensOption o) {
        return LensOptionResponse.builder()
                .optionId(o.getOptionId())
                .optionName(o.getOptionName())
                .extraPrice(o.getExtraPrice())
                .build();
    }

    private LensResponse toLensResponse(Lens l) {
        List<LensOptionResponse> options = l.getOptions() == null
                ? List.of()
                : l.getOptions().stream()
                .map(this::toLensOptionResponse)
                .collect(Collectors.toList());
        return LensResponse.builder()
                .lensId(l.getLensId())
                .name(l.getName())
                .lensType(l.getLensType())
                .material(l.getMaterial())
                .indexValue(l.getIndexValue())
                .price(l.getPrice())
                .status(l.getStatus())
                .options(options)
                .build();
    }

    private ReadyMadeGlassesResponse toReadyMadeGlassesResponse(ReadyMadeGlasses r) {
        return ReadyMadeGlassesResponse.builder()
                .productId(r.getProductId())
                .name(r.getName())
                .brand(r.getBrand())
                .price(r.getPrice())
                .stockQuantity(r.getStockQuantity())
                .imageUrl(r.getImageUrl())
                .description(r.getDescription())
                .status(r.getStatus())
                .build();
    }
}