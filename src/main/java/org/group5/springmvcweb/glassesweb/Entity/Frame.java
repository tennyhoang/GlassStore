package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Frame")
public class Frame {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "frame_id")
    private Integer frameId;
    @Column(name = "brand")
    private String brand;
    @Column(name = "material")
    private String material;
    @Column(name = "size")
    private String size;
    @Column(name = "rim_type")
    private String rimType;
    @Column(name = "price")
    private double price;

    public Integer getFrameId() { return frameId; }
    public void setFrameId(Integer frameId) { this.frameId = frameId; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getRimType() { return rimType; }
    public void setRimType(String rimType) { this.rimType = rimType; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}