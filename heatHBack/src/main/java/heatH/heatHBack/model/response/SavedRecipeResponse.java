package heatH.heatHBack.model.response;

import lombok.Data;

@Data
public class SavedRecipeResponse {
    private Long recipeId;
    private String photo;
    private String title;
}
