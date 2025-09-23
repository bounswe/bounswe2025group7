package heatH.heatHBack.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users_verification")
@Data
public class UserMailVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private Integer code;

    private LocalDateTime createdAt;

    public UserMailVerification() {
        this.createdAt = LocalDateTime.now();
    }
    public UserMailVerification(String email, Integer code) {
        this.email = email;
        this.code = code;
        this.createdAt = LocalDateTime.now();
    }
}
