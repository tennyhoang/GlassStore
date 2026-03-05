package org.group5.springmvcweb.glassesweb.Entity.eye;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "EyeProfile")
public class EyeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eye_profile_id")  // Thêm @Column với tên cột snake_case
    private Integer eyeProfileId;

    @Column(name = "customer_id")
    private Integer customerId;

    private String source;

    @Column(name = "created_date")
    private LocalDateTime createDate = LocalDateTime.now();

    private String status;

    public Integer getEyeProfileId() {
        return eyeProfileId;
    }

    public void setEyeProfileId(Integer eyeProfileId) {
        this.eyeProfileId = eyeProfileId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}