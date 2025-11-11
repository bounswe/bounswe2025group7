package heatH.heatHBack.model.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalorieResponse {
    private int recipeId;
    private int calorie;
    private String name;
    private String image;
}
