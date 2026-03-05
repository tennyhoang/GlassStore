package org.group5.springmvcweb.glassesweb.Service.design;

import org.group5.springmvcweb.glassesweb.Entity.design.GlassesDesign;
import org.group5.springmvcweb.glassesweb.Entity.design.DesignFrame;
import org.group5.springmvcweb.glassesweb.Entity.design.DesignLens;

public interface GlassesDesignService {
    GlassesDesign createGlassesDesign(Integer eyeProfileId);
    DesignFrame addFrame(Integer designId, Integer frameId);
    DesignLens addLens(Integer designId, String eyeSide, Integer lensId, Integer lensOptionId);
    double calculateTotalPrice(Integer designId);
    GlassesDesign saveSnapshot(Integer designId, String snapshotUrl);
}