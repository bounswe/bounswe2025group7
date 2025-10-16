package heatH.heatHBack.model.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FatSecretClient {

    private static final String TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
    private static final String API_URL = "https://platform.fatsecret.com/rest/server.api";

    @Value("${fatsecret.client-id}")
    private String clientId;

    @Value("${fatsecret.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /** Step 1️⃣: Get OAuth token */
    private String getAccessToken() {
        String credentials = clientId + ":" + clientSecret;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "Basic " + encoded);

        String body = "grant_type=client_credentials&scope=basic";
        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(TOKEN_URL, HttpMethod.POST, entity, Map.class);

        if (response.getBody() != null && response.getBody().get("access_token") != null) {
            return (String) response.getBody().get("access_token");
        } else {
            throw new RuntimeException("❌ Could not obtain access token");
        }
    }

    /** Step 2️⃣: Search food and extract structured nutrition info */
    public Map<String, Object> getFoodNutrition(String query) {
        String token = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(API_URL)
                .queryParam("method", "foods.search")
                .queryParam("search_expression", query)
                .queryParam("format", "json")
                .queryParam("max_results", 1);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                Map.class
        );

        if (response.getBody() == null || !response.getBody().containsKey("foods")) {
            return Map.of("error", "No food data returned from FatSecret");
        }

        Map foods = (Map) response.getBody().get("foods");
        if (foods == null || foods.isEmpty()) {
            return Map.of("error", "No food found for query: " + query);
        }

        // ✅ Handle both single-object and list responses
        Object foodObj = foods.get("food");
        Map<String, Object> firstFood;
        if (foodObj instanceof java.util.List) {
            firstFood = (Map<String, Object>) ((java.util.List<?>) foodObj).get(0);
        } else if (foodObj instanceof java.util.Map) {
            firstFood = (Map<String, Object>) foodObj;
        } else {
            throw new RuntimeException("Unexpected food data format: " + foodObj.getClass());
        }

        String name = (String) firstFood.get("food_name");
        String desc = (String) firstFood.get("food_description");

        // ✅ Parse numeric values using regex
        int weight = parseInt(desc, "Per (\\d+)g", 100);
        int calories = parseInt(desc, "Calories: (\\d+)", 0);
        int protein = parseInt(desc, "Protein: (\\d+)", 0);
        int fat = parseInt(desc, "Fat: (\\d+)", 0);
        int carbs = parseInt(desc, "Carbs: (\\d+)", 0);

        return Map.of(
                "name", name,
                "weight", weight,
                "calories", calories,
                "protein", protein,
                "fat", fat,
                "carbs", carbs
        );
    }

    /** Utility to extract integer values with regex and default */
    private int parseInt(String text, String regex, int defaultValue) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultValue;
    }
}
