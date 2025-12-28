package it.fithub.fithubspring.controller;

import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.service.FriendshipService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "http://localhost:4200")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<Void> sendFriendRequest(@PathVariable Long receiverId) {
        // TODO: Alessandro - Implementare il controllo della sessione utente qui
        // TODO: Sostituire senderId hardcoded con l'ID dell'utente autenticato dalla

        Long senderId = 1L;
        friendshipService.sendFriendRequest(senderId, receiverId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable Long requestId) {
        friendshipService.acceptFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<User>> getFriends() {
        // TODO: Alessandro - Implementare il controllo della sessione utente qui
        // TODO: Sostituire userId hardcoded con l'ID dell'utente autenticato dalla
        Long userId = 1L;
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }
}
