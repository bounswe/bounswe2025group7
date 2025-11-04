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

        // Orijinal makrolar
        totals.put("carbs", 0.0);
        totals.put("fat", 0.0);
        totals.put("protein", 0.0);

        // İstenen yeni alanlar
        totals.put("vitamin_a", 0.0);
        totals.put("vitamin_c", 0.0);
        totals.put("sodium", 0.0);
        totals.put("saturated_fat", 0.0);
        totals.put("potassium", 0.0);
        totals.put("cholesterol", 0.0);
        totals.put("calcium", 0.0);
        totals.put("iron", 0.0);

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

                // Orijinal makro değerlerini al (Bunlar 'int' olarak geliyor)
                double baseCarbs = ((Number) nutrition.getOrDefault("carbs", 0.0)).doubleValue();
                double baseFat = ((Number) nutrition.getOrDefault("fat", 0.0)).doubleValue();
                double baseProtein = ((Number) nutrition.getOrDefault("protein", 0.0)).doubleValue();

                // Yeni mikro değerlerini al (Bunlar 'double' olarak geliyor)
                double baseVitaminA = ((Number) nutrition.getOrDefault("vitamin_a", 0.0)).doubleValue();
                double baseVitaminC = ((Number) nutrition.getOrDefault("vitamin_c", 0.0)).doubleValue();
                double baseSodium = ((Number) nutrition.getOrDefault("sodium", 0.0)).doubleValue();
                double baseSaturatedFat = ((Number) nutrition.getOrDefault("saturated_fat", 0.0)).doubleValue();
                double basePotassium = ((Number) nutrition.getOrDefault("potassium", 0.0)).doubleValue();
                double baseCholesterol = ((Number) nutrition.getOrDefault("cholesterol", 0.0)).doubleValue();
                double baseCalcium = ((Number) nutrition.getOrDefault("calcium", 0.0)).doubleValue();
                double baseIron = ((Number) nutrition.getOrDefault("iron", 0.0)).doubleValue();

                // Ağırlık hesaplaması (Orijinal)
                int baseWeight = ((Number) nutrition.getOrDefault("weight", 100)).intValue();
                int quantity = ingredient.getQuantity() != null ? ingredient.getQuantity() : 0;

                // baseWeight 0 ise hatayı önle
                if (baseWeight == 0) {
                    System.err.println("⚠️ Base weight is 0 for " + ingredient.getName() + ", skipping.");
                    continue;
                }

                double weightFactor = quantity / (double) baseWeight;

                // Orijinal makroları güncelle
                totals.put("carbs", totals.get("carbs") + baseCarbs * weightFactor);
                totals.put("fat", totals.get("fat") + baseFat * weightFactor);
                totals.put("protein", totals.get("protein") + baseProtein * weightFactor);

                // Yeni mikroları güncelle
                totals.put("vitamin_a", totals.get("vitamin_a") + baseVitaminA * weightFactor);
                totals.put("vitamin_c", totals.get("vitamin_c") + baseVitaminC * weightFactor);
                totals.put("sodium", totals.get("sodium") + baseSodium * weightFactor);
                totals.put("saturated_fat", totals.get("saturated_fat") + baseSaturatedFat * weightFactor);
                totals.put("potassium", totals.get("potassium") + basePotassium * weightFactor);
                totals.put("cholesterol", totals.get("cholesterol") + baseCholesterol * weightFactor);
                totals.put("calcium", totals.get("calcium") + baseCalcium * weightFactor);
                totals.put("iron", totals.get("iron") + baseIron * weightFactor);

            } catch (Exception e) {
                System.err.println("❌ Error fetching nutrients for ingredient " + ingredient.getName() + ": " + e.getMessage());
            }
        }

        // Round to 2 decimal places for readability (Orijinal)
        totals.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);
        return totals;
    }
}
