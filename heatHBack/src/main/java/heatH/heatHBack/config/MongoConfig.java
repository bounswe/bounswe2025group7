package heatH.heatHBack.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(mongoClient, getDatabaseNameFromUri(mongoUri));
    }

    private String getDatabaseNameFromUri(String uri) {
        try {
            String afterSlash = uri.substring(uri.indexOf("/", uri.indexOf("://") + 3) + 1);
            int q = afterSlash.indexOf("?");
            if (q > 0) afterSlash = afterSlash.substring(0, q);
            // if empty, fall back to default 'test'
            return afterSlash.isEmpty() ? "test" : afterSlash;
        } catch (Exception e) {
            return "test";
        }
    }
}