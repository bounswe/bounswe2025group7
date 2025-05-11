package heatH.heatHBack.service.implementation;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.SavedRecipe;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.SavedRecipeRequest;
import heatH.heatHBack.model.response.SavedRecipeResponse;
import heatH.heatHBack.repository.RecipeRepository;
import heatH.heatHBack.repository.SavedRecipeRepository;
import heatH.heatHBack.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SavedRecipeService {
    private final SavedRecipeRepository savedRecipeRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    @Transactional
    public void saveRecipe(SavedRecipeRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Recipe recipe = recipeRepository.findById(request.getRecipeId()).orElseThrow(() -> new RuntimeException("Recipe not found"));
        
        SavedRecipe savedRecipe = new SavedRecipe();
        savedRecipe.setRecipe(recipe);
        savedRecipe.setUser(user);
        savedRecipe.setTitle(recipe.getTitle());
        savedRecipe.setPhoto(recipe.getPhoto());
        savedRecipeRepository.save(savedRecipe);
    }

    @Transactional
    public void unsaveRecipe(SavedRecipeRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Recipe recipe = recipeRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        savedRecipeRepository.deleteByUserAndRecipe(user, recipe);
    }

    public List<SavedRecipeResponse> getSavedRecipesForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<SavedRecipe> savedRecipes = savedRecipeRepository.findAllByUserId(user.getId());

        return savedRecipes.stream().map(s -> {
            SavedRecipeResponse response = new SavedRecipeResponse();
            response.setRecipeId(s.getRecipe().getId());
            response.setPhoto(s.getPhoto());
            response.setTitle(s.getTitle());
            return response;
        }).collect(Collectors.toList());

        
    }


}
