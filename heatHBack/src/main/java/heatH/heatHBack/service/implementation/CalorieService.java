package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.Ingredients;
import heatH.heatHBack.model.client.FatSecretClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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

    public Map<String, Double> calculateMacronutrients(List<Ingredients> ingredients) {
        Map<String, Double> totals = new HashMap<>();
        totals.put("carbs", 0.0);
        totals.put("fat", 0.0);
        totals.put("protein", 0.0);

        if (ingredients == null || ingredients.isEmpty()) {
            return totals;
        }

        for (Ingredients ingredient : ingredients) {
            try {
                Map<String, Object> nutrition = fatSecretClient.getFoodNutrition(ingredient.getName());

                if (nutrition.containsKey("error")) {
                    System.err.println("⚠️ FatSecret lookup failed for " + ingredient.getName());
                    continue;
                }

                double baseCarbs = ((Number) nutrition.getOrDefault("carbs", 0.0)).doubleValue();
                double baseFat = ((Number) nutrition.getOrDefault("fat", 0.0)).doubleValue();
                double baseProtein = ((Number) nutrition.getOrDefault("protein", 0.0)).doubleValue();
                int baseWeight = ((Number) nutrition.getOrDefault("weight", 100)).intValue();
                int quantity = ingredient.getQuantity() != null ? ingredient.getQuantity() : 0;

                double weightFactor = quantity / (double) baseWeight;

                totals.put("carbs", totals.get("carbs") + baseCarbs * weightFactor);
                totals.put("fat", totals.get("fat") + baseFat * weightFactor);
                totals.put("protein", totals.get("protein") + baseProtein * weightFactor);

            } catch (Exception e) {
                System.err.println("❌ Error fetching macronutrients for ingredient " + ingredient.getName() + ": " + e.getMessage());
            }
        }

        // Round to 2 decimal places for readability
        totals.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);
        return totals;
    }
}
