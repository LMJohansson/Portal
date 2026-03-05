package com.portal.auth;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "portal_user", uniqueConstraints = {
    @UniqueConstraint(columnNames = "username"),
    @UniqueConstraint(columnNames = "email")
})
public class User extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(nullable = false, unique = true, length = 50)
    public String username;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;

    @NotBlank
    @Column(name = "full_name", nullable = false, length = 100)
    public String fullName;

    @Email
    @Column(nullable = false, unique = true, length = 150)
    public String email;

    /** Comma-separated list of roles, e.g. "ADMIN,USER" */
    @NotBlank
    @Column(nullable = false, length = 200)
    public String roles;

    @Column(nullable = false)
    public boolean enabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Set<String> getRoleSet() {
        return Arrays.stream(roles.split(","))
            .map(String::trim)
            .filter(r -> !r.isBlank())
            .collect(Collectors.toSet());
    }

    public static User findByUsername(String username) {
        return find("username", username).firstResult();
    }
}
