package it.fithub.fithubspring.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class GeminiApiService {
    private final Client client;
    private final GenerateContentConfig generationConfig;

    public GeminiApiService(Client client) {
        this.client = client;
        this.generationConfig = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText("You are a Personal Trainer. Your name is Neko.")))
                .build();
    }

    public String getGeminiResponse(String augmentedPrompt) {
        try {
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.5-flash",
                    augmentedPrompt,
                    generationConfig);

            return response.text();
        } catch (Exception e) {
            System.err.println("Errore durante la chiamata a Gemini: " + e.getMessage());
            e.printStackTrace();
            return "Sorry, I could not get a response from the AI.";
        }
    }
}