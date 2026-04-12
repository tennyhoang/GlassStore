package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "EyeProfile")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EyeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "eye_profile_id")
    private Integer eyeProfileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "profile_name", length = 255)
    private String profileName;

    @Column(name = "source", length = 50)
    @Enumerated(EnumType.STRING)
    private EyeProfileSource source;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "status", length = 50)
    @Enumerated(EnumType.STRING)
    private EyeProfileStatus status;

    @OneToMany(mappedBy = "eyeProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EyePrescription> prescriptions;

    @OneToMany(mappedBy = "eyeProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionFile> files;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
        if (this.status == null) this.status = EyeProfileStatus.ACTIVE;
    }

    public enum EyeProfileSource  { MANUAL, UPLOADED }
    public enum EyeProfileStatus  { ACTIVE, INACTIVE }


}