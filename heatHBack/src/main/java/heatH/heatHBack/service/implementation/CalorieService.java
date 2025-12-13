package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.Ingredients;
import heatH.heatHBack.model.MeasurementTypes;
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
                        // baseWeight is usually 100g or the serving size in grams provided by API
                        int baseWeight = (int) nutrition.getOrDefault("weight", 100);

                        // --- CHANGED HERE ---
                        // Convert the unit quantity to grams using the Enum
                        MeasurementTypes type = ingredient.getType() != null ? ingredient.getType() : MeasurementTypes.GRAM;
                        double quantityInGrams = type.toGrams(ingredient.getQuantity() != null ? ingredient.getQuantity() : 0);

                        // Scale calories: (Calories / BaseWeight) * ActualGrams
                        if (baseWeight == 0) baseWeight = 100; // Prevent division by zero
                        double scaledCalories = (baseCalories * (quantityInGrams / (double) baseWeight));

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

        // Initialize totals
        String[] keys = {
                "carbs", "fat", "protein", "vitamin_a", "vitamin_c",
                "sodium", "saturated_fat", "potassium", "cholesterol",
                "calcium", "iron"
        };
        for (String key : keys) totals.put(key, 0.0);

        if (ingredients == null || ingredients.isEmpty()) {
            return totals;
        }

        for (Ingredients ingredient : ingredients) {
            try {
                Map<String, Object> nutrition = fatSecretClient.getFoodNutrition(ingredient.getName());

                if (nutrition.containsKey("error")) {
                    System.err.println("⚠️ FatSecret lookup failed for : " + ingredient.getName());
                    continue;
                }

                // --- CHANGED HERE ---
                // 1. Calculate the actual weight in grams based on the Unit Type
                MeasurementTypes type = ingredient.getType() != null ? ingredient.getType() : MeasurementTypes.GRAM;
                double quantityInGrams = type.toGrams(ingredient.getQuantity() != null ? ingredient.getQuantity() : 0);

                // 2. Get the base weight from API (usually 100g)
                int baseWeight = ((Number) nutrition.getOrDefault("weight", 100)).intValue();

                if (baseWeight == 0) {
                    System.err.println("⚠️ Base weight is 0 for " + ingredient.getName() + ", skipping.");
                    continue;
                }

                // 3. Calculate the factor (e.g., if user has 200g flour and base is 100g, factor is 2.0)
                double weightFactor = quantityInGrams / (double) baseWeight;

                // 4. Update all nutrients using the weight factor
                // Helper to simplify fetching and adding
                updateTotal(totals, nutrition, "carbs", weightFactor);
                updateTotal(totals, nutrition, "fat", weightFactor);
                updateTotal(totals, nutrition, "protein", weightFactor);
                updateTotal(totals, nutrition, "vitamin_a", weightFactor);
                updateTotal(totals, nutrition, "vitamin_c", weightFactor);
                updateTotal(totals, nutrition, "sodium", weightFactor);
                updateTotal(totals, nutrition, "saturated_fat", weightFactor);
                updateTotal(totals, nutrition, "potassium", weightFactor);
                updateTotal(totals, nutrition, "cholesterol", weightFactor);
                updateTotal(totals, nutrition, "calcium", weightFactor);
                updateTotal(totals, nutrition, "iron", weightFactor);

            } catch (Exception e) {
                System.err.println("❌ Error fetching nutrients for ingredient " + ingredient.getName() + ": " + e.getMessage());
            }
        }

        // Round to 2 decimal places
        totals.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);
        return totals;
    }

    // Helper method to keep the code clean
    private void updateTotal(Map<String, Double> totals, Map<String, Object> nutrition, String key, double factor) {
        double baseValue = ((Number) nutrition.getOrDefault(key, 0.0)).doubleValue();
        totals.put(key, totals.get(key) + (baseValue * factor));
    }
}