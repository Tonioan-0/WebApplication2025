package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.dto.ChatRequest;
import it.fithub.fithubspring.dto.ChatResponse;
import it.fithub.fithubspring.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        // TODO: Alessandro - Implementare il controllo della sessione utente qui
        // TODO: Verificare che l'utente sia autenticato prima di permettere l'accesso

        return chatService.getReply(request);
    }
}
