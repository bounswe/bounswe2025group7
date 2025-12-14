package heatH.heatHBack.service.implementation;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import heatH.heatHBack.model.NutritionData;

@Service
public class OpenAIService {

    private final WebClient webClient;
    private final String model;

    public OpenAIService(@Value("${openai.apiKey}") String apiKey,
                         @Value("${openai.model:text-embedding-3-small}") String model) {
        this.model = model;
        this.webClient = WebClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public double[] createEmbedding(String text) {
        Map<String, Object> body = Map.of("model", model, "input", text);
        Map resp = webClient.post()
            .uri("/embeddings")
            .bodyValue(body)
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        if (resp == null || !resp.containsKey("data")) throw new RuntimeException("Empty embedding response");
        List data = (List) resp.get("data");
        if (data.isEmpty()) throw new RuntimeException("No embedding data returned");
        Map first = (Map) data.get(0);
        List<Number> embeddingList = (List<Number>) first.get("embedding");

        double[] embedding = new double[embeddingList.size()];
        for (int i = 0; i < embeddingList.size(); i++) {
            embedding[i] = embeddingList.get(i).doubleValue();
        }
        return embedding;
    }
    public double calculateHealthinessScore(NutritionData nutritionData, int totalCalories) {
        String prompt = String.format(
            "Based on the following nutritional data for a recipe, provide a healthiness score from 1 to 5 (where 5 is very healthy and 1 is unhealthy). " +
            "Consider all factors including macronutrients, micronutrients, and overall nutritional balance. " +
            "Only respond with a single number between 1 and 5, with one decimal place (e.g., 3.5).\n\n" +
            "Total Calories: %d\n" +
            "Carbohydrates: %.2fg\n" +
            "Fat: %.2fg\n" +
            "Protein: %.2fg\n" +
            "Vitamin A: %.2fmcg\n" +
            "Vitamin C: %.2fmg\n" +
            "Sodium: %.2fmg\n" +
            "Saturated Fat: %.2fg\n" +
            "Potassium: %.2fmg\n" +
            "Cholesterol: %.2fmg\n" +
            "Calcium: %.2fmg\n" +
            "Iron: %.2fmg",
            totalCalories,
            nutritionData.getCarbs() != null ? nutritionData.getCarbs() : 0.0,
            nutritionData.getFat() != null ? nutritionData.getFat() : 0.0,
            nutritionData.getProtein() != null ? nutritionData.getProtein() : 0.0,
            nutritionData.getVitaminA() != null ? nutritionData.getVitaminA() : 0.0,
            nutritionData.getVitaminC() != null ? nutritionData.getVitaminC() : 0.0,
            nutritionData.getSodium() != null ? nutritionData.getSodium() : 0.0,
            nutritionData.getSaturatedFat() != null ? nutritionData.getSaturatedFat() : 0.0,
            nutritionData.getPotassium() != null ? nutritionData.getPotassium() : 0.0,
            nutritionData.getCholesterol() != null ? nutritionData.getCholesterol() : 0.0,
            nutritionData.getCalcium() != null ? nutritionData.getCalcium() : 0.0,
            nutritionData.getIron() != null ? nutritionData.getIron() : 0.0
        );

    Map<String, Object> message = Map.of(
            "role", "user",
            "content", prompt
        );

        Map<String, Object> body = Map.of(
            "model", "gpt-4o-mini",
            "messages", List.of(message),
            "temperature", 0.3,
            "max_tokens", 10
        );
    
        try {
            Map resp = webClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (resp == null || !resp.containsKey("choices")) {
                throw new RuntimeException("Empty response from OpenAI");
            }

            List choices = (List) resp.get("choices");
            if (choices.isEmpty()) {
                throw new RuntimeException("No choices in OpenAI response");
            }

            Map firstChoice = (Map) choices.get(0);
            Map messageContent = (Map) firstChoice.get("message");
            String content = (String) messageContent.get("content");

            // Parse the score from the response
            double score = Double.parseDouble(content.trim());
            
            // Ensure score is between 1 and 5
            if (score < 1.0) score = 1.0;
            if (score > 5.0) score = 5.0;

            return score;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get healthiness score from OpenAI", e);
        }
}

}