package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.Ingredients;
import heatH.heatHBack.model.client.FatSecretClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalorieService {

    private final FatSecretClient fatSecretClient;

    public Integer calculateCalorie(List<Ingredients> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            return 0;
        }

        return ingredients.stream()
                .mapToInt(ingredient -> {
                    try {
                        Map<String, Object> nutrition = fatSecretClient.getFoodNutrition(ingredient.getName());

                        if (nutrition.containsKey("error")) {
                            System.err.println("⚠️ FatSecret lookup failed for " + ingredient.getName());
                            return 0;
                        }

                        int baseCalories = (int) nutrition.getOrDefault("calories", 0);
                        int baseWeight = (int) nutrition.getOrDefault("weight", 100);
                        int quantity = ingredient.getQuantity() != null ? ingredient.getQuantity() : 0;

                        // Scale calories linearly with weight
                        double scaledCalories = (baseCalories * (quantity / (double) baseWeight));
                        return (int) Math.round(scaledCalories);

                    } catch (Exception e) {
                        System.err.println("❌ Error fetching nutrition for ingredient " + ingredient.getName() + ": " + e.getMessage());
                        return 0;
                    }
                })
                .sum();
    }
}
