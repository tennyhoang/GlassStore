package org.group5.springmvcweb.glassesweb.Service.design;

import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.group5.springmvcweb.glassesweb.Entity.Lens;
import org.group5.springmvcweb.glassesweb.Entity.LensOption;
import org.group5.springmvcweb.glassesweb.Entity.design.GlassesDesign;
import org.group5.springmvcweb.glassesweb.Entity.design.DesignFrame;
import org.group5.springmvcweb.glassesweb.Entity.design.DesignLens;
import org.group5.springmvcweb.glassesweb.Repository.FrameRepository;
import org.group5.springmvcweb.glassesweb.Repository.LensRepository;
import org.group5.springmvcweb.glassesweb.Repository.LensOptionRepository;
import org.group5.springmvcweb.glassesweb.Repository.design.GlassesDesignRepository;
import org.group5.springmvcweb.glassesweb.Repository.design.DesignFrameRepository;
import org.group5.springmvcweb.glassesweb.Repository.design.DesignLensRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GlassesDesignServiceImpl implements GlassesDesignService {

    @Autowired
    private GlassesDesignRepository glassesDesignRepository;

    @Autowired
    private DesignFrameRepository designFrameRepository;

    @Autowired
    private DesignLensRepository designLensRepository;

    @Autowired
    private FrameRepository frameRepository;

    @Autowired
    private LensRepository lensRepository;

    @Autowired
    private LensOptionRepository lensOptionRepository;

    @Override
    public GlassesDesign createGlassesDesign(Integer eyeProfileId) {
        GlassesDesign design = new GlassesDesign();
        design.setEyeProfileId(eyeProfileId);
        design.setStatus("DRAFT");
        return glassesDesignRepository.save(design);
    }

    @Override
    public DesignFrame addFrame(Integer designId, Integer frameId) {
        GlassesDesign design = glassesDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thiết kế"));
        Frame frame = frameRepository.findById(frameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính"));

        DesignFrame designFrame = new DesignFrame();
        designFrame.setDesignId(designId);
        designFrame.setFrameId(frameId);
        return designFrameRepository.save(designFrame);
    }

    @Override
    public DesignLens addLens(Integer designId, String eyeSide, Integer lensId, Integer lensOptionId) {
        GlassesDesign design = glassesDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thiết kế"));
        Lens lens = lensRepository.findById(lensId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính"));
        LensOption option = lensOptionRepository.findById(lensOptionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy option lens"));

        DesignLens designLens = new DesignLens();
        designLens.setDesignId(designId);
        designLens.setEyeSide(eyeSide);
        designLens.setLensId(lensId);
        designLens.setLensOptionId(lensOptionId);
        return designLensRepository.save(designLens);
    }

    @Override
    public double calculateTotalPrice(Integer designId) {
        GlassesDesign design = glassesDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thiết kế"));

        double total = 0.0;

        // Tính giá Frame
        DesignFrame designFrame = (DesignFrame) designFrameRepository.findByDesignId(designId);  // Giả sử có method findByDesignId
        if (designFrame != null) {
            Frame frame = frameRepository.findById(designFrame.getFrameId()).orElse(null);
            if (frame != null) total += frame.getPrice();
        }

        // Tính giá Lens (cả 2 bên mắt nếu có)
        List<DesignLens> designLenses = designLensRepository.findByDesignId(designId);  // Giả sử có method findByDesignId
        for (DesignLens dl : designLenses) {
            Lens lens = lensRepository.findById(dl.getLensId()).orElse(null);
            LensOption option = lensOptionRepository.findById(dl.getLensOptionId()).orElse(null);
            if (lens != null) total += lens.getBasePrice();
            if (option != null) total += option.getExtraPrice();
        }

        return total;  // Trả giá, có thể lưu vào DB sau này nếu cần thêm field
    }

    @Override
    public GlassesDesign saveSnapshot(Integer designId, String snapshotUrl) {
        GlassesDesign design = glassesDesignRepository.findById(designId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thiết kế"));
        design.setStatus("COMPLETED");
        return glassesDesignRepository.save(design);
    }
}