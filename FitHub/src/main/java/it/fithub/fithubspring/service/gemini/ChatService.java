package it.fithub.fithubspring.service.gemini;

import it.fithub.fithubspring.service.KnowledgeBaseService;
import it.fithub.fithubspring.dto.gemini.ChatRequest;
import it.fithub.fithubspring.dto.gemini.ChatResponse;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final KnowledgeBaseService knowledgeBaseService;
    private final GeminiApiService geminiApiService;

    public ChatService(KnowledgeBaseService knowledgeBaseService, GeminiApiService geminiApiService) {
        this.knowledgeBaseService = knowledgeBaseService;
        this.geminiApiService = geminiApiService;
    }

    public ChatResponse getReply(ChatRequest request) {
        return getReplyWithSession("default-session", request);
    }

    public ChatResponse getReplyWithSession(String sessionId, ChatRequest request) {
        String context = knowledgeBaseService.findContext(request.message());
        String augmentedMessage = context.isEmpty()
                ? request.message()
                : "Context: " + context + "\n\nUser: " + request.message();

        String reply = geminiApiService.getChatResponse(sessionId, augmentedMessage);

        return new ChatResponse(reply);
    }

    public void clearSession(String sessionId) {
        geminiApiService.clearSession(sessionId);
    }
}
