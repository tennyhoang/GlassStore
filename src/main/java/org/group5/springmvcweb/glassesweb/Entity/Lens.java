package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Lens")
public class Lens {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lens_id")
    private Integer lensId;
    @Column(name = "brand")
    private String brand;
    @Column(name = "lens_type")
    private String lensType;
    @Column(name = "min_sph")
    private double minSph;
    @Column(name = "max_sph")
    private double maxSph;
    @Column(name = "base_price")
    private double basePrice;

    public Integer getLensId() { return lensId; }
    public void setLensId(Integer lensId) { this.lensId = lensId; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getLensType() { return lensType; }
    public void setLensType(String lensType) { this.lensType = lensType; }

    public double getMinSph() { return minSph; }
    public void setMinSph(double minSph) { this.minSph = minSph; }

    public double getMaxSph() { return maxSph; }
    public void setMaxSph(double maxSph) { this.maxSph = maxSph; }

    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
}