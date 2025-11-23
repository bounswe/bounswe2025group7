package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.CalorieTracking;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.response.CalorieResponse;
import heatH.heatHBack.repository.CalorieTrackingRepository;
import heatH.heatHBack.repository.RecipeRepository;
import heatH.heatHBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalorieTrackingService {
    private final CalorieTrackingRepository calorieTrackingRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    public void toggleCalorieTracking(String recipeId, Date eatenDate, Double portion) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        Long recipeIdLong = Long.valueOf(recipeId);

        Optional<CalorieTracking> existingTracking = calorieTrackingRepository
                .findByUserIdAndRecipeIdAndEatenDateIgnoringTime(userId, recipeIdLong, eatenDate);

        if (existingTracking.isPresent()) {
            calorieTrackingRepository.delete(existingTracking.get());
        } else {
            CalorieTracking newTracking = new CalorieTracking();
            newTracking.setUserId(userId);
            newTracking.setRecipeId(recipeIdLong);
            newTracking.setEatenDate(eatenDate);
            newTracking.setPortion(portion);
            calorieTrackingRepository.save(newTracking);
        }
    }

    public List<CalorieResponse> getUserCalorieTracking(Date checkDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        List<CalorieTracking> trackingList = calorieTrackingRepository
                .findAllByUserIdAndEatenDateIgnoringTime(userId, checkDate);

        return trackingList.stream()
                .map(tracking -> {
                    Optional<Recipe> recipeOpt = recipeRepository.findById(tracking.getRecipeId());

                    if (recipeOpt.isEmpty()) {
                        return null; // Skip if recipe is not found
                    }

                    Recipe recipe = recipeOpt.get();

                    // Calculate consumed calories based on portion
                    int consumedCalorie = (int) (recipe.getTotalCalorie() * tracking.getPortion());

                    return CalorieResponse.builder()
                            .recipeId(recipe.getId().intValue())
                            .calorie(consumedCalorie)
                            .name(recipe.getTitle())
                            .image(recipe.getPhoto())
                            .build();
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    public void updateCalorieTracking(String recipeId, Date eatenDate, Double portion) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        Long recipeIdLong = Long.valueOf(recipeId);

        Optional<CalorieTracking> existingTracking = calorieTrackingRepository
                .findByUserIdAndRecipeIdAndEatenDateIgnoringTime(userId, recipeIdLong, eatenDate);

        if (existingTracking.isPresent()) {
            existingTracking.get().setPortion(portion);
            calorieTrackingRepository.save(existingTracking.get());
        }
    }
}