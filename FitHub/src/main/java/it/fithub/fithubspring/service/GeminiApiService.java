package it.fithub.fithubspring.service;

import com.google.genai.Client;
import com.google.genai.types.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeminiApiService {
    private final Client client;
    private final GenerateContentConfig generationConfig;

    // In-memory conversation storage: sessionId -> List of messages
    private final Map<String, List<Content>> conversationHistory = new ConcurrentHashMap<>();

    public GeminiApiService(Client client) {
        this.client = client;
        this.generationConfig = GenerateContentConfig.builder()
                .systemInstruction(Content.fromParts(Part.fromText(
                        "You are Neko, a knowledgeable and motivating Personal Trainer. " +
                                "Provide fitness advice, workout routines, and nutritional guidance. " +
                                "Be encouraging and supportive while keeping responses concise and actionable.")))
                .build();
    }

    public String getChatResponse(String sessionId, String userMessage) {
        try {
            List<Content> history = conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
            history.add(Content.fromParts(Part.fromText(userMessage)));

            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.0-flash-exp",
                    history,
                    generationConfig);

            String aiResponse = response.text();

            // Add AI response to history
            history.add(Content.fromParts(Part.fromText(aiResponse)));

            return aiResponse;
        } catch (Exception e) {
            System.err.println("Errore durante la chiamata a Gemini: " + e.getMessage());
            e.printStackTrace();
            return "Sorry, I could not get a response from the AI.";
        }
    }

    public void clearSession(String sessionId) {
        conversationHistory.remove(sessionId);
    }

    public int getActiveSessionsCount() {
        return conversationHistory.size();
    }
}