package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.ChatRequest;
import it.fithub.fithubspring.dto.ChatResponse;
import it.fithub.fithubspring.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200") // Allow requests from Angular app
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.getReply(request);
    }
}
