package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "LensOption")
public class LensOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lens_option_id")
    private Integer lensOptionId;
    @Column(name = "index_value")
    private String indexValue;
    @Column(name = "coating")
    private String coating;
    @Column(name = "extra_price")
    private double extraPrice;

    public Integer getLensOptionId() { return lensOptionId; }
    public void setLensOptionId(Integer lensOptionId) { this.lensOptionId = lensOptionId; }

    public String getIndexValue() { return indexValue; }
    public void setIndexValue(String indexValue) { this.indexValue = indexValue; }

    public String getCoating() { return coating; }
    public void setCoating(String coating) { this.coating = coating; }

    public double getExtraPrice() { return extraPrice; }
    public void setExtraPrice(double extraPrice) { this.extraPrice = extraPrice; }
}