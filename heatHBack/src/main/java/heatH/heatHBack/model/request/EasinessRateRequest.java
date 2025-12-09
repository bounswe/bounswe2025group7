package heatH.heatHBack.model.request;

import lombok.Data;

@Data
public class EasinessRateRequest {
    private Long recipeId;
    private int easinessRate;
}