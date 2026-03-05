package org.group5.springmvcweb.glassesweb.Controller.design;

import org.group5.springmvcweb.glassesweb.Entity.design.GlassesDesign;
import org.group5.springmvcweb.glassesweb.Entity.design.DesignFrame;
import org.group5.springmvcweb.glassesweb.Entity.design.DesignLens;
import org.group5.springmvcweb.glassesweb.Service.design.GlassesDesignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/glasses-designs")
public class GlassesDesignController {

    @Autowired
    private GlassesDesignService service;

    private Integer getCurrentCustomerId() {
        return 1;  // Hardcode để test, sau này thay bằng auth thật
    }

    // Tạo thiết kế mới (dựa trên eyeProfileId)
    @PostMapping
    public ResponseEntity<GlassesDesign> create(@RequestParam Integer eyeProfileId) {
        GlassesDesign created = service.createGlassesDesign(eyeProfileId);
        return ResponseEntity.ok(created);
    }

    // Thêm Frame cho thiết kế
    @PostMapping("/{id}/frame")
    public ResponseEntity<DesignFrame> addFrame(@PathVariable Integer id, @RequestParam Integer frameId) {
        DesignFrame added = service.addFrame(id, frameId);
        return ResponseEntity.ok(added);
    }

    // Thêm Lens cho thiết kế (có eyeSide và lensOptionId nếu có)
    @PostMapping("/{id}/lens")
    public ResponseEntity<DesignLens> addLens(
            @PathVariable Integer id,
            @RequestParam String eyeSide,
            @RequestParam Integer lensId,
            @RequestParam(required = false) Integer lensOptionId) {
        DesignLens added = service.addLens(id, eyeSide, lensId, lensOptionId);
        return ResponseEntity.ok(added);
    }

    // Tính giá tổng thiết kế
    @GetMapping("/{id}/price")
    public ResponseEntity<Double> calculatePrice(@PathVariable Integer id) {
        double price = service.calculateTotalPrice(id);
        return ResponseEntity.ok(price);
    }

    // Lưu snapshot (ảnh thiết kế) và hoàn tất
    @PostMapping("/{id}/snapshot")
    public ResponseEntity<GlassesDesign> snapshot(@PathVariable Integer id, @RequestParam String snapshotUrl) {
        GlassesDesign updated = service.saveSnapshot(id, snapshotUrl);
        return ResponseEntity.ok(updated);
    }
}