package it.fithub.fithubspring.controller.gemini;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.dto.gemini.ChatRequest;
import it.fithub.fithubspring.dto.gemini.ChatResponse;
import it.fithub.fithubspring.service.gemini.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(chatService.getReply(request));
    }
}
