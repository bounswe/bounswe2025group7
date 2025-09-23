package heatH.heatHBack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import heatH.heatHBack.model.SavedRecipe;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.Recipe;

public interface SavedRecipeRepository extends JpaRepository<SavedRecipe, Long> {
    Optional<SavedRecipe> findByUserAndRecipe(User user, Recipe recipe);
    List<SavedRecipe> findAllByUserId(Long userId);
    void deleteByUserAndRecipe(User user, Recipe recipe);
    void deleteByRecipe(Recipe recipe);
}
