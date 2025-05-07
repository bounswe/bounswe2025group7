package heatH.heatHBack.service.implementation;

import java.util.Optional;

import heatH.heatHBack.model.User;
import heatH.heatHBack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.RecipeRequest;
import heatH.heatHBack.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public Recipe saveRecipe(RecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setTitle(request.getTitle());
        recipe.setInstructions(request.getInstructions());
        recipe.setIngredients(request.getIngredients());
        recipe.setPhoto(request.getPhoto());
        recipe.setTag(request.getTag());
        recipe.setType(request.getType());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        recipe.setUser(user);
        return recipeRepository.save(recipe);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
}
