package heatH.heatHBack.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class InterestForm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String surname;
    private LocalDate dateOfBirth;
    private Integer height;
    private Double weight;
    private String profilePhoto;
    private String gender;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
