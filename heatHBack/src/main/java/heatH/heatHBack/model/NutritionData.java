package heatH.heatHBack.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class NutritionData {

    private double carbs;
    private double fat;
    private double protein;

    private double vitaminA;
    private double vitaminC;
    private double sodium;
    private double saturatedFat;
    private double potassium;
    private double cholesterol;
    private double calcium;
    private double iron;
}
