package heatH.heatHBack.service.implementation;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import heatH.heatHBack.model.RecipeEmbedding;
import heatH.heatHBack.repository.RecipeEmbeddingRepository;
import heatH.heatHBack.repository.RecipeRepository;
import heatH.heatHBack.model.Recipe;

@Service
public class SemanticSearchService {

    private final OpenAIService openAIService;
    private final RecipeEmbeddingRepository embeddingRepo;
    private final RecipeRepository recipeRepo;

    public SemanticSearchService(OpenAIService openAIService,
                                 RecipeEmbeddingRepository embeddingRepo,
                                 RecipeRepository recipeRepo) {
        this.openAIService = openAIService;
        this.embeddingRepo = embeddingRepo;
        this.recipeRepo = recipeRepo;
    }

    public List<Recipe> search(String query, int topK) {
        double[] qEmb = openAIService.createEmbedding(query);
        List<RecipeEmbedding> all = embeddingRepo.findAll();

        return all.stream()
            .map(e -> Map.entry(e, cosineSimilarity(qEmb, e.getEmbedding())))
            .sorted((a,b) -> Double.compare(b.getValue(), a.getValue()))
            .limit(topK)
            .map(e -> e.getKey().getRecipeId())
            .filter(Objects::nonNull)
            .map(recipeRepo::findById)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }

    private double cosineSimilarity(double[] a, double[] b) {
        if (a == null || b == null) return 0.0;
        int len = Math.min(a.length, b.length);
        double dot = 0.0, na = 0.0, nb = 0.0;
        for (int i = 0; i < len; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0.0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    // helper to persist embedding after recipe creation/update
    public void saveEmbeddingForRecipe(Long recipeId, double[] embedding) {
        RecipeEmbedding re = new RecipeEmbedding(recipeId, embedding);
        embeddingRepo.save(re);
    }

    public void deleteEmbeddingForRecipe(Long recipeId) {
        if (recipeId == null) return;
        embeddingRepo.findByRecipeId(recipeId).ifPresent(embeddingRepo::delete);
    }
}