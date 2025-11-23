package heatH.heatHBack.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "calorie_tracking")
public class CalorieTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long recipeId;
    private Double portion;
    private Date eatenDate;
}
