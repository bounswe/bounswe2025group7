package heatH.heatHBack.repository;

import heatH.heatHBack.model.Recipe;

import java.util.List;
import java.util.Optional;

import heatH.heatHBack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, Long>{
    Optional<Recipe> findByTitle(String title);
    Optional<List<Recipe>> findAllByUser(User user);
}
