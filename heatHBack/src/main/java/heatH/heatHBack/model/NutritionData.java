package heatH.heatHBack.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class NutritionData {
    private double carbs;
    private double fat;
    private double protein;
}
