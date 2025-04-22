package heatH.heatHBack.service.implementation;

import java.util.Optional;

import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.RecipeRequest;
import heatH.heatHBack.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeService {
    private final RecipeRepository recipeRepository;

    public Recipe saveRecipe(RecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setTitle(request.getTitle());
        recipe.setInstructions(request.getInstructions());
        recipe.setIngredients(request.getIngredients());
        recipe.setPhoto(request.getPhoto());
        recipe.setTag(request.getTag());
        recipe.setType(request.getType());
        recipe.setUserId(request.getUserID());
        return recipeRepository.save(recipe);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
}
