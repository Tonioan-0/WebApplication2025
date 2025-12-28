package it.fithub.fithubspring.config;

import com.google.genai.Client;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String apiKey;

    @PostConstruct
    public void validateApiKey() {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("${gemini.api.key}")) {
            printRedError("ERRORE: La variabile di ambiente 'GEMINI_API_KEY' non è configurata!");
            printRedError("Configura la variabile prima di avviare l'applicazione.");
            throw new IllegalStateException("Gemini API key non configurata");
        }
        System.out.println("✓ Gemini API key configurata correttamente");
    }

    @Bean
    @ConditionalOnProperty(name = "gemini.api.enabled", havingValue = "true", matchIfMissing = false)
    public Client geminiClient() {
        return new Client.Builder()
                .apiKey(apiKey)
                .build();
    }

    private void printRedError(String message) {
        String ANSI_RED = "\u001B[31m";
        String ANSI_RESET = "\u001B[0m";
        System.err.println(ANSI_RED + "================================" + ANSI_RESET);
        System.err.println(ANSI_RED + message + ANSI_RESET);
        System.err.println(ANSI_RED + "================================" + ANSI_RESET);
    }
}