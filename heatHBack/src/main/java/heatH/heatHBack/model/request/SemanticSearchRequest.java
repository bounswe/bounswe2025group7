package heatH.heatHBack.model.request;

import lombok.Data;

@Data
public class SemanticSearchRequest {
    private String query;
    private int topK = 5;
}