package it.fithub.fithubspring.service;

import it.fithub.fithubspring.dto.ChatRequest;
import it.fithub.fithubspring.dto.ChatResponse;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final KnowledgeBaseService knowledgeBaseService;
    private final GeminiApiService geminiApiService;

    public ChatService(KnowledgeBaseService knowledgeBaseService, GeminiApiService geminiApiService) {
        this.knowledgeBaseService = knowledgeBaseService;
        this.geminiApiService = geminiApiService;
    }

    /**
     * Get reply with conversation history support.
     * Uses a default session ID for now. In production, should use user ID.
     */
    public ChatResponse getReply(ChatRequest request) {
        return getReplyWithSession("default-session", request);
    }

    /**
     * Get reply for a specific session with conversation history.
     */
    public ChatResponse getReplyWithSession(String sessionId, ChatRequest request) {
        // Add knowledge base context
        String context = knowledgeBaseService.findContext(request.message());
        String augmentedMessage = context.isEmpty()
                ? request.message()
                : "Context: " + context + "\n\nUser: " + request.message();

        // Get response with conversation history
        String reply = geminiApiService.getChatResponse(sessionId, augmentedMessage);

        return new ChatResponse(reply);
    }

    /**
     * Clear conversation history for a session
     */
    public void clearSession(String sessionId) {
        geminiApiService.clearSession(sessionId);
    }
}
