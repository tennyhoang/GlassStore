package org.group5.springmvcweb.glassesweb.Service;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final FrameRepository            frameRepository;
    private final LensRepository             lensRepository;
    private final LensOptionRepository       lensOptionRepository;
    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;

    // =============================================
    // FRAME — List (cache + pagination)
    // =============================================

    /**
     * Lay tat ca frames — cache de tranh query DB moi lan.
     * Cache bi xoa khi co frame moi / cap nhat / xoa (@CacheEvict).
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "frames", key = "'all'")
    public List<FrameResponse> getAllFrames() {
        return frameRepository.findByStatusIn(List.of("AVAILABLE", "OUT_OF_STOCK"))
                .stream().map(this::toFrameResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lay frames voi phan trang — dung cho ShopPage khi co nhieu san pham.
     */
    @Transactional(readOnly = true)
    public PageResponse<FrameResponse> getFramesPaged(Pageable pageable) {
        Page<FrameResponse> page = frameRepository
                .findByStatusIn(List.of("AVAILABLE", "OUT_OF_STOCK"), pageable)
                .map(this::toFrameResponse);
        return PageResponse.of(page);
    }

    /**
     * Tim kiem frames theo tu khoa + phan trang.
     * Giu lai de tuong thich nguoc — logic chinh da chuyen vao filterFrames.
     */
    @Transactional(readOnly = true)
    public PageResponse<FrameResponse> searchFrames(String q, Pageable pageable) {
        Page<FrameResponse> page = frameRepository
                .searchByNameOrBrand(q, List.of("AVAILABLE", "OUT_OF_STOCK"), pageable)
                .map(this::toFrameResponse);
        return PageResponse.of(page);
    }

    /**
     * Filter nang cao: keyword + brand + material + color + shape + price range.
     *
     * Tat ca param deu optional — null = bo qua dieu kien do.
     * Thay the method filterFrames cu (3 param) — gio nhan 8 param.
     *
     * @param keyword  tim theo ten hoac brand
     * @param brand    loc theo thuong hieu
     * @param material loc theo chat lieu (Titanium, Acetate, ...)
     * @param color    loc theo mau sac
     * @param shape    loc theo hinh dang gong (Oval, Rectangle, Round, ...)
     * @param minPrice gia tu
     * @param maxPrice gia den
     * @param pageable phan trang va sap xep
     */
    @Transactional(readOnly = true)
    public PageResponse<FrameResponse> filterFrames(
            String keyword, String brand, String material,
            String color,   String shape,
            BigDecimal minPrice, BigDecimal maxPrice,
            Pageable pageable) {

        // Normalize: chuoi rong -> null de query bo qua dieu kien
        keyword  = normalize(keyword);
        brand    = normalize(brand);
        material = normalize(material);
        color    = normalize(color);
        shape    = normalize(shape);

        Page<FrameResponse> page = frameRepository
                .findByFilters(
                        List.of("AVAILABLE", "OUT_OF_STOCK"),
                        brand, material, color, shape,
                        minPrice, maxPrice, keyword,
                        pageable)
                .map(this::toFrameResponse);

        return PageResponse.of(page);
    }

    private String normalize(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    // =============================================
    // FRAME — Single + CRUD
    // =============================================

    @Transactional(readOnly = true)
    @Cacheable(value = "frames", key = "#frameId")
    public FrameResponse getFrameById(Integer frameId) {
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay gong kinh ID: " + frameId));
        return toFrameResponse(frame);
    }

    @Transactional
    @CacheEvict(value = "frames", allEntries = true)
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
    @CacheEvict(value = "frames", allEntries = true)
    public FrameResponse updateFrame(Integer frameId, FrameRequest request) {
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay gong kinh ID: " + frameId));
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
    @CacheEvict(value = "frames", allEntries = true)
    public void deleteFrame(Integer frameId) {
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay gong kinh ID: " + frameId));
        frame.setStatus("DISCONTINUED");
        frameRepository.save(frame);
    }

    // =============================================
    // LENS
    // =============================================

    @Transactional(readOnly = true)
    @Cacheable(value = "lenses", key = "'all'")
    public List<LensResponse> getAllLenses() {
        return lensRepository.findByStatus("AVAILABLE")
                .stream().map(this::toLensResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LensResponse getLensById(Integer lensId) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay trong kinh ID: " + lensId));
        return toLensResponse(lens);
    }

    @Transactional
    @CacheEvict(value = "lenses", allEntries = true)
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
    @CacheEvict(value = "lenses", allEntries = true)
    public LensResponse updateLens(Integer lensId, LensRequest request) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay trong kinh ID: " + lensId));
        lens.setName(request.getName());
        lens.setLensType(request.getLensType());
        lens.setMaterial(request.getMaterial());
        lens.setIndexValue(request.getIndexValue());
        lens.setPrice(request.getPrice());
        return toLensResponse(lensRepository.save(lens));
    }

    @Transactional
    @CacheEvict(value = "lenses", allEntries = true)
    public void deleteLens(Integer lensId) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay trong kinh ID: " + lensId));
        lens.setStatus("DISCONTINUED");
        lensRepository.save(lens);
    }

    @Transactional
    @CacheEvict(value = "lenses", allEntries = true)
    public LensOptionResponse addLensOption(Integer lensId, LensOptionRequest request) {
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay trong kinh ID: " + lensId));
        LensOption option = LensOption.builder()
                .lens(lens)
                .optionName(request.getOptionName())
                .extraPrice(request.getExtraPrice())
                .build();
        return toLensOptionResponse(lensOptionRepository.save(option));
    }

    @Transactional
    @CacheEvict(value = "lenses", allEntries = true)
    public void deleteLensOption(Integer optionId) {
        lensOptionRepository.deleteById(optionId);
    }

    // =============================================
    // READY MADE GLASSES
    // =============================================

    @Transactional(readOnly = true)
    @Cacheable(value = "readyMadeGlasses", key = "'all'")
    public List<ReadyMadeGlassesResponse> getAllReadyMadeGlasses() {
        return readyMadeGlassesRepository.findByStatus("AVAILABLE")
                .stream().map(this::toReadyMadeGlassesResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReadyMadeGlassesResponse getReadyMadeGlassesById(Integer productId) {
        ReadyMadeGlasses product = readyMadeGlassesRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay san pham ID: " + productId));
        return toReadyMadeGlassesResponse(product);
    }

    @Transactional
    @CacheEvict(value = "readyMadeGlasses", allEntries = true)
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
    @CacheEvict(value = "readyMadeGlasses", allEntries = true)
    public ReadyMadeGlassesResponse updateReadyMadeGlasses(Integer productId,
                                                           ReadyMadeGlassesRequest request) {
        ReadyMadeGlasses product = readyMadeGlassesRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay san pham ID: " + productId));
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setDescription(request.getDescription());
        return toReadyMadeGlassesResponse(readyMadeGlassesRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "readyMadeGlasses", allEntries = true)
    public void deleteReadyMadeGlasses(Integer productId) {
        ReadyMadeGlasses product = readyMadeGlassesRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay san pham ID: " + productId));
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