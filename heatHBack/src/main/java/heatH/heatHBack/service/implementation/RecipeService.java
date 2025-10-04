package heatH.heatHBack.service.implementation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import heatH.heatHBack.model.User;
import heatH.heatHBack.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.Ingredients;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.RecipeRequest;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final GcsService gcsService;
    private final SavedRecipeRepository savedRecipeRepository;
    private final FeedRepository feedRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final OpenAIService openAIService;
    private final SemanticSearchService semanticSearchService;

    public Recipe saveRecipe(RecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setTitle(request.getTitle());
        recipe.setInstructions(request.getInstructions());
        recipe.setIngredients(request.getIngredients());
        recipe.setTag(request.getTag());
        recipe.setType(request.getType());
        recipe.setTotalCalorie(request.getTotalCalorie());
        recipe.setPrice(request.getPrice());

        if (request.getPhoto() != null) {
            String fileName = "user-profile-" + UUID.randomUUID() + ".jpg";
            String imageUrl = gcsService.uploadBase64Image(request.getPhoto(), fileName);
            recipe.setPhoto(imageUrl);
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        recipe.setUser(user);

        List<Ingredients> ingredients = recipe.getIngredients();
        String ingredientsText = ingredients.stream()
                .map(Ingredients::getName)
                .collect(Collectors.joining(", "));
        Recipe savedRecipe = recipeRepository.save(recipe);
        double[] emb = openAIService.createEmbedding(savedRecipe.getTitle() + " " + ingredientsText);
        semanticSearchService.saveEmbeddingForRecipe(savedRecipe.getId(), emb);
        return savedRecipe;
        
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
    @Transactional
    public void deleteRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        savedRecipeRepository.deleteByRecipe(recipe);
        List<Feed> feedsToDelete = feedRepository.findByRecipeId(id);
        feedRepository.deleteAll(feedsToDelete);
        recipeRepository.deleteById(id);
        likeRepository.deleteAllByFeedIn(feedsToDelete);
        commentRepository.deleteAllByFeedIn(feedsToDelete);
        semanticSearchService.deleteEmbeddingForRecipe(id);
    }
    public Optional<List<Recipe>> getAllRecipes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return recipeRepository.findAllByUser(user);
    }
}
