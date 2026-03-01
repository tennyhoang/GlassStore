package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer accountId;

    private Integer customerId;
    @Column(unique = true)
    private String username;

    @Column(name = "password_hash")
    private String passwordHash;

    private String role;

    private LocalDateTime createdAt;

    public Integer getCustomerId() {
        return customerId;
    }
}