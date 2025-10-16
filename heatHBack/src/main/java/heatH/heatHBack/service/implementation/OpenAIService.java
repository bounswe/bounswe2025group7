package heatH.heatHBack.service.implementation;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

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
}