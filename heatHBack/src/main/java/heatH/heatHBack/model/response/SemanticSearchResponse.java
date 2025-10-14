package heatH.heatHBack.model.response;

import lombok.Data;
import heatH.heatHBack.model.Recipe;
import java.util.List;

@Data
public class SemanticSearchResponse {
    private List<Recipe> results;
}