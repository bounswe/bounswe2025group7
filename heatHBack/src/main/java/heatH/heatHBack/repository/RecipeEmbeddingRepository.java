package heatH.heatHBack.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import heatH.heatHBack.model.RecipeEmbedding;

@Repository
public interface RecipeEmbeddingRepository extends MongoRepository<RecipeEmbedding, String> {
    Optional<RecipeEmbedding> findByRecipeId(Long recipeId);
    List<RecipeEmbedding> findAll();
}