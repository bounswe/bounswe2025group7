package heatH.heatHBack.service.implementation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
    private final GcsService gcsService;

    public Recipe saveRecipe(RecipeRequest request) {
        Recipe recipe = new Recipe();
        recipe.setTitle(request.getTitle());
        recipe.setInstructions(request.getInstructions());
        recipe.setIngredients(request.getIngredients());
        recipe.setTag(request.getTag());
        recipe.setType(request.getType());

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
        return recipeRepository.save(recipe);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
    public Optional<List<Recipe>> getAllRecipes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return recipeRepository.findAllByUser(user);
    }
}
