package heatH.heatHBack.model.request;

import java.util.List;

import heatH.heatHBack.model.Ingredients;
import lombok.Data;

@Data
public class RecipeRequest {
    private String title;
    private List<String> instructions;
    private List<Ingredients> ingredients;
    private String tag;
    private String type;
    private String photo;
    private Integer totalCalorie;
    private Double price;
}
