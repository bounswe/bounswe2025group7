package heatH.heatHBack.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class NutritionData {

    private Double carbs;
    private Double fat;
    private Double protein;

    private Double vitaminA;
    private Double vitaminC;
    private Double sodium;
    private Double saturatedFat;
    private Double potassium;
    private Double cholesterol;
    private Double calcium;
    private Double iron;
}
