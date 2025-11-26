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
        // In a real app, you'd get the sender's ID from the security context
        Long senderId = 1L; // Placeholder for the current user's ID
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
        // In a real app, you'd get the user's ID from the security context
        Long userId = 1L; // Placeholder for the current user's ID
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }
}
