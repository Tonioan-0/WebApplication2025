package it.fithub.fithubspring.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Bean
    @ConditionalOnProperty(name = "gemini.api.enabled", havingValue = "true", matchIfMissing = false)
    public Client geminiClient() {
        return new Client.Builder()
                .apiKey(apiKey)
                .build();
    }
}