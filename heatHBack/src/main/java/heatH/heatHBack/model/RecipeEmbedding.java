package heatH.heatHBack.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "heath-backend")
public class RecipeEmbedding {
    @Id
    private String id;
    private Long recipeId;
    private double[] embedding;
    private LocalDateTime createdAt;

    public RecipeEmbedding() {}
    public RecipeEmbedding(Long recipeId, double[] embedding){
        this.recipeId = recipeId;
        this.embedding = embedding;
        this.createdAt = LocalDateTime.now();
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Long getRecipeId() { return recipeId; }
    public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }
    public double[] getEmbedding() { return embedding; }
    public void setEmbedding(double[] embedding) { this.embedding = embedding; }
}