package heatH.heatHBack.model.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap; // Değişiklik: Map.of() yerine HashMap kullanmak için
import java.util.List;    // Değişiklik: JSON yanıtını işlemek için
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

    /** Step 1️⃣: Get OAuth token (Orijinal, Değişiklik Yok) */
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

    /** Step 2️⃣: Search food AND get micronutrients (GÜNCELLENDİ) */
    public Map<String, Object> getFoodNutrition(String query) {
        String token = getAccessToken();

        // --- BÖLÜM 1: ORİJİNAL 'foods.search' ÇAĞRISI (DEĞİŞTİRİLMEDİ) ---
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

        // --- ORİJİNAL REGEX HESAPLAMALARI (DEĞİŞTİRİLMEDİ) ---
        int weight = parseInt(desc, "Per (\\d+)g", 100);
        int calories = parseInt(desc, "Calories: (\\d+)", 0);
        int protein = parseInt(desc, "Protein: (\\d+)", 0);
        int fat = parseInt(desc, "Fat: (\\d+)", 0);
        int carbs = parseInt(desc, "Carbs: (\\d+)", 0);

        // Değişiklik: Map.of() yerine değiştirilebilir bir HashMap başlat
        Map<String, Object> nutritionMap = new HashMap<>();
        nutritionMap.put("name", name);
        nutritionMap.put("weight", weight);
        nutritionMap.put("calories", calories);
        nutritionMap.put("protein", protein);
        nutritionMap.put("fat", fat);
        nutritionMap.put("carbs", carbs);

        // --- BÖLÜM 2: YENİ 'food.get' ÇAĞRISI (MİKROLAR İÇİN EKLENDİ) ---
        try {
            String foodId = (String) firstFood.get("food_id");
            if (foodId == null) {
                // food_id yoksa mikrolar olmadan devam et
                return nutritionMap;
            }

            // Mikroları almak için YENİ API çağrısı
            HttpHeaders microHeaders = new HttpHeaders();
            microHeaders.setBearerAuth(token);

            UriComponentsBuilder microBuilder = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("method", "food.get")
                    .queryParam("food_id", foodId)
                    .queryParam("format", "json");

            HttpEntity<Void> microEntity = new HttpEntity<>(microHeaders);
            ResponseEntity<Map> microResponse = restTemplate.exchange(
                    microBuilder.toUriString(),
                    HttpMethod.GET,
                    microEntity,
                    Map.class
            );

            if (microResponse.getBody() != null && microResponse.getBody().containsKey("food")) {
                Map<String, Object> foodDetails = (Map<String, Object>) microResponse.getBody().get("food");
                Map<String, Object> servings = (Map<String, Object>) foodDetails.get("servings");

                Object servingObj = servings.get("serving");
                Map<String, Object> firstServing;

                // İstediğiniz gibi: 'serving' dizisinden ilk elemanı al
                if (servingObj instanceof java.util.List) {
                    if (!((List<?>) servingObj).isEmpty()) {
                        firstServing = (Map<String, Object>) ((List<?>) servingObj).get(0);
                    } else {
                        throw new RuntimeException("Serving list is empty for food_id: " + foodId);
                    }
                } else if (servingObj instanceof java.util.Map) {
                    firstServing = (Map<String, Object>) servingObj;
                } else {
                    throw new RuntimeException("Unexpected serving data format for food_id: " + foodId);
                }

                // İstediğiniz mikroları haritaya ekle (ondalıklı olabilecekleri için Double kullan)
                nutritionMap.put("vitamin_a", parseDouble(firstServing, "vitamin_a"));
                nutritionMap.put("vitamin_c", parseDouble(firstServing, "vitamin_c"));
                nutritionMap.put("sodium", parseDouble(firstServing, "sodium"));
                nutritionMap.put("saturated_fat", parseDouble(firstServing, "saturated_fat"));
                nutritionMap.put("potassium", parseDouble(firstServing, "potassium"));
                nutritionMap.put("cholesterol", parseDouble(firstServing, "cholesterol"));
                nutritionMap.put("calcium", parseDouble(firstServing, "calcium"));
                nutritionMap.put("iron", parseDouble(firstServing, "iron"));
            }

        } catch (Exception e) {
            // İkinci çağrı (mikro) başarısız olursa, en azından makroları döndür
            System.err.println("⚠️ Could not fetch micronutrients for " + name + ": " + e.getMessage());
        }

        return nutritionMap;
    }

    /** Utility to extract integer values (Orijinal, Değişiklik Yok) */
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

    /** YENİ Utility: API yanıtındaki String sayıları güvenle Double'a çevirir */
    private double parseDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return 0.0;
        }
        try {
            // API bazen "0", bazen "0.00" döndürebilir, Double.parseDouble ikisini de işler
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}