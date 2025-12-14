package heatH.heatHBack.service.implementation;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import heatH.heatHBack.model.*;
import heatH.heatHBack.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.request.RecipeRequest;
import heatH.heatHBack.model.request.EasinessRateRequest;
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
    private final CalorieService calorieService;
    private final EasinessRateRepository easinessRateRepository;


    public Recipe saveRecipe(RecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setTitle(request.getTitle());
        recipe.setInstructions(request.getInstructions());
        recipe.setIngredients(request.getIngredients());
        recipe.setTag(request.getTag());
        recipe.setType(request.getType());
        //recipe.setTotalCalorie(request.getTotalCalorie());
        recipe.setTotalCalorie(calorieService.calculateCalorie(request.getIngredients()));

        // Besin verilerini hesapla
        Map<String, Double> macros = calorieService.calculateMacronutrients(request.getIngredients());

        NutritionData nutritionData = new NutritionData();
        // Orijinal makroları ayarla
        nutritionData.setCarbs(macros.getOrDefault("carbs", 0.0));
        nutritionData.setFat(macros.getOrDefault("fat", 0.0));
        nutritionData.setProtein(macros.getOrDefault("protein", 0.0));

        // --- YENİ EKLENEN BÖLÜM ---
        // Yeni mikroları ayarla
        nutritionData.setVitaminA(macros.getOrDefault("vitamin_a", 0.0));
        nutritionData.setVitaminC(macros.getOrDefault("vitamin_c", 0.0));
        nutritionData.setSodium(macros.getOrDefault("sodium", 0.0));
        nutritionData.setSaturatedFat(macros.getOrDefault("saturated_fat", 0.0));
        nutritionData.setPotassium(macros.getOrDefault("potassium", 0.0));
        nutritionData.setCholesterol(macros.getOrDefault("cholesterol", 0.0));
        nutritionData.setCalcium(macros.getOrDefault("calcium", 0.0));
        nutritionData.setIron(macros.getOrDefault("iron", 0.0));
        // --- YENİ BÖLÜMÜN SONU ---

        recipe.setNutritionData(nutritionData);
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

    public List<Recipe> getAllRecipesForAll() {
        return recipeRepository.findAll();
    }

    public EasinessRate rateEasiness(EasinessRateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recipe recipe = recipeRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        // Check if user already rated this recipe
        Optional<EasinessRate> existingRate = easinessRateRepository.findByUserAndRecipe(user, recipe);
        
        EasinessRate easinessRate;
        if (existingRate.isPresent()) {
            // Update existing rating
            easinessRate = existingRate.get();
            easinessRate.setEasiness_rate(request.getEasinessRate());
        } else {
            // Create new rating
            easinessRate = new EasinessRate();
            easinessRate.setUser(user);
            easinessRate.setRecipe(recipe);
            easinessRate.setEasiness_rate(request.getEasinessRate());
        }
        
        return easinessRateRepository.save(easinessRate);
    }

    public Double getAverageEasinessRate(Long recipeId) {
        return easinessRateRepository.findAverageEasinessRateByRecipeId(recipeId);
    }

    public Integer getEasinessRateByUser(Long recipeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        Optional<EasinessRate> easinessRate = easinessRateRepository.findByUserAndRecipe(user, recipe);
        
        return easinessRate.map(EasinessRate::getEasiness_rate).orElse(null);
    }
}
