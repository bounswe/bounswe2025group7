package heatH.heatHBack.repository;
import heatH.heatHBack.model.EasinessRate;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EasinessRateRepository extends JpaRepository<EasinessRate, Long> {
    
    @Query("SELECT AVG(e.easiness_rate) FROM EasinessRate e WHERE e.recipe.id = :recipeId")
    Double findAverageEasinessRateByRecipeId(@Param("recipeId") Long recipeId);
    
    Optional<EasinessRate> findByUserAndRecipe(User user, Recipe recipe);
}
