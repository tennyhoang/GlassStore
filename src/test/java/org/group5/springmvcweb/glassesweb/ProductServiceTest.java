package org.group5.springmvcweb.glassesweb;

import org.group5.springmvcweb.glassesweb.DTO.FrameRequest;
import org.group5.springmvcweb.glassesweb.DTO.FrameResponse;
import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.group5.springmvcweb.glassesweb.Repository.FrameRepository;
import org.group5.springmvcweb.glassesweb.Repository.LensOptionRepository;
import org.group5.springmvcweb.glassesweb.Repository.LensRepository;
import org.group5.springmvcweb.glassesweb.Repository.ReadyMadeGlassesRepository;
import org.group5.springmvcweb.glassesweb.Service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho ProductService — tập trung vào Frame CRUD.
 *
 * Cách chạy: mvn test -Dtest=ProductServiceTest
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService — Unit Tests")
class ProductServiceTest {

    @Mock private FrameRepository          frameRepository;
    @Mock private LensRepository           lensRepository;
    @Mock private LensOptionRepository     lensOptionRepository;
    @Mock private ReadyMadeGlassesRepository readyMadeGlassesRepository;

    @InjectMocks
    private ProductService productService;

    // ── Fixtures ───────────────────────────────────────────────────────────────
    private Frame sampleFrame;
    private FrameRequest sampleFrameRequest;

    @BeforeEach
    void setUp() {
        sampleFrame = Frame.builder()
                .frameId(1)
                .name("Ray-Ban Classic")
                .brand("Ray-Ban")
                .color("Đen")
                .material("Titanium")
                .shape("Oval")
                .price(new BigDecimal("1500000"))
                .stockQuantity(10)
                .status("AVAILABLE")
                .build();

        sampleFrameRequest = FrameRequest.builder()
                .name("Ray-Ban Classic")
                .brand("Ray-Ban")
                .color("Đen")
                .material("Titanium")
                .shape("Oval")
                .price(new BigDecimal("1500000"))
                .stockQuantity(10)
                .build();
    }

    // ── getAllFrames() ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllFrames — có dữ liệu → trả về danh sách")
    void getAllFrames_hasData_returnsList() {
        // Arrange
        Frame frame2 = Frame.builder()
                .frameId(2).name("Oakley Sport").brand("Oakley")
                .price(new BigDecimal("2000000")).stockQuantity(5)
                .status("AVAILABLE").build();

        when(frameRepository.findByStatusIn(List.of("AVAILABLE", "OUT_OF_STOCK")))
                .thenReturn(List.of(sampleFrame, frame2));

        // Act
        List<FrameResponse> result = productService.getAllFrames();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Ray-Ban Classic");
        assertThat(result.get(1).getName()).isEqualTo("Oakley Sport");

        verify(frameRepository, times(1)).findByStatusIn(anyList());
    }

    @Test
    @DisplayName("getAllFrames — không có dữ liệu → trả về danh sách rỗng")
    void getAllFrames_empty_returnsEmptyList() {
        when(frameRepository.findByStatusIn(anyList())).thenReturn(List.of());

        List<FrameResponse> result = productService.getAllFrames();

        assertThat(result).isEmpty();
    }

    // ── getFrameById() ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getFrameById — tìm thấy → trả về FrameResponse")
    void getFrameById_found_returnsResponse() {
        when(frameRepository.findById(1)).thenReturn(Optional.of(sampleFrame));

        FrameResponse result = productService.getFrameById(1);

        assertThat(result).isNotNull();
        assertThat(result.getFrameId()).isEqualTo(1);
        assertThat(result.getName()).isEqualTo("Ray-Ban Classic");
        assertThat(result.getBrand()).isEqualTo("Ray-Ban");
        assertThat(result.getPrice()).isEqualByComparingTo(new BigDecimal("1500000"));
    }

    @Test
    @DisplayName("getFrameById — không tìm thấy → ném RuntimeException")
    void getFrameById_notFound_throwsException() {
        when(frameRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getFrameById(999))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("999");
    }

    // ── createFrame() ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("createFrame — data hợp lệ → lưu và trả về FrameResponse")
    void createFrame_validRequest_savesAndReturns() {
        when(frameRepository.save(any(Frame.class))).thenReturn(sampleFrame);

        FrameResponse result = productService.createFrame(sampleFrameRequest);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Ray-Ban Classic");
        assertThat(result.getStatus()).isEqualTo("AVAILABLE"); // status mặc định khi tạo mới

        // Verify frame được save đúng 1 lần
        verify(frameRepository, times(1)).save(any(Frame.class));
    }

    // ── updateFrame() ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateFrame — frame tồn tại → cập nhật thành công")
    void updateFrame_exists_updatesSuccessfully() {
        FrameRequest updateRequest = FrameRequest.builder()
                .name("Ray-Ban Classic Updated")
                .brand("Ray-Ban")
                .price(new BigDecimal("1800000"))
                .stockQuantity(15)
                .build();

        Frame updatedFrame = Frame.builder()
                .frameId(1).name("Ray-Ban Classic Updated").brand("Ray-Ban")
                .price(new BigDecimal("1800000")).stockQuantity(15)
                .status("AVAILABLE").build();

        when(frameRepository.findById(1)).thenReturn(Optional.of(sampleFrame));
        when(frameRepository.save(any(Frame.class))).thenReturn(updatedFrame);

        FrameResponse result = productService.updateFrame(1, updateRequest);

        assertThat(result.getName()).isEqualTo("Ray-Ban Classic Updated");
        assertThat(result.getPrice()).isEqualByComparingTo(new BigDecimal("1800000"));

        verify(frameRepository, times(1)).findById(1);
        verify(frameRepository, times(1)).save(any(Frame.class));
    }

    @Test
    @DisplayName("updateFrame — frame không tồn tại → ném RuntimeException")
    void updateFrame_notFound_throwsException() {
        when(frameRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.updateFrame(999, sampleFrameRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("999");

        verify(frameRepository, never()).save(any());
    }

    // ── deleteFrame() ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteFrame — frame tồn tại → đặt status DISCONTINUED (soft delete)")
    void deleteFrame_exists_setsDiscontinued() {
        when(frameRepository.findById(1)).thenReturn(Optional.of(sampleFrame));
        when(frameRepository.save(any(Frame.class))).thenReturn(sampleFrame);

        productService.deleteFrame(1);

        // Verify frame bị set DISCONTINUED, không phải xoá khỏi DB
        verify(frameRepository, times(1)).save(argThat(f ->
                "DISCONTINUED".equals(f.getStatus())
        ));
        verify(frameRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("deleteFrame — frame không tồn tại → ném RuntimeException")
    void deleteFrame_notFound_throwsException() {
        when(frameRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteFrame(999))
                .isInstanceOf(RuntimeException.class);

        verify(frameRepository, never()).save(any());
    }
}
