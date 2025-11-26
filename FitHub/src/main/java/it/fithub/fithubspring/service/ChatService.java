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

    public ChatResponse getReply(ChatRequest request) {
        String context = knowledgeBaseService.findContext(request.message());
        String augmentedPrompt = context + "\n\nUser question: " + request.message();
        String reply = geminiApiService.getGeminiResponse(augmentedPrompt);
        return new ChatResponse(reply);
    }
}
