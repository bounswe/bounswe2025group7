package heatH.heatHBack.model.request;

import java.util.List;

import lombok.Data;

@Data
public class RecipeRequest {
    private String title;
    private List<String> instructions;
    private List<String> ingredients;
    private String tag;
    private String type;
    private String photo;
    private Long userID;
}
