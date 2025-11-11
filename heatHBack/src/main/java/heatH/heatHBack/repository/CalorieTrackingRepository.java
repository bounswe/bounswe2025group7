package heatH.heatHBack.repository;

import heatH.heatHBack.model.CalorieTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalorieTrackingRepository extends JpaRepository<CalorieTracking, Long> {
    @Query(value = "SELECT * FROM calorie_tracking ct " +
            "WHERE ct.user_id = :userId " +
            "AND ct.recipe_id = :recipeId " +
            "AND DATE(ct.eaten_date) = DATE(:eatenDate)",
            nativeQuery = true)
    Optional<CalorieTracking> findByUserIdAndRecipeIdAndEatenDateIgnoringTime(
            Long userId,
            Long recipeId,
            Date eatenDate
    );

    @Query(value = "SELECT * FROM calorie_tracking ct " +
            "WHERE ct.user_id = :userId " +
            "AND DATE(ct.eaten_date) = DATE(:checkDate)",
            nativeQuery = true)
    List<CalorieTracking> findAllByUserIdAndEatenDateIgnoringTime(
            Long userId,
            Date checkDate
    );

}
