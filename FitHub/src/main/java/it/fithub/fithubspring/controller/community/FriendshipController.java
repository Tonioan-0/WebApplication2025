package it.fithub.fithubspring.controller.community;

import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.domain.community.FriendRequest;
import it.fithub.fithubspring.dto.community.FriendDTO;
import it.fithub.fithubspring.dto.community.FriendRequestDTO;
import it.fithub.fithubspring.service.community.FriendshipService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    private Long getUserIdFromSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return null;
        }
        return user.getId();
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<Void> sendFriendRequest(@PathVariable Long receiverId, HttpSession session) {
        Long senderId = getUserIdFromSession(session);
        if (senderId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        friendshipService.sendFriendRequest(senderId, receiverId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable Long requestId) {
        friendshipService.acceptFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject/{requestId}")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable Long requestId) {
        friendshipService.rejectFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<FriendDTO>> getFriends(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<User> friends = friendshipService.getFriends(userId);
        List<FriendDTO> dtos = friends.stream()
                .map(u -> new FriendDTO(u.getId(), u.getUsername(), u.getEmail()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequests(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<FriendRequest> requests = friendshipService.getPendingRequests(userId);
        List<FriendRequestDTO> dtos = requests.stream()
                .map(r -> new FriendRequestDTO(
                        r.getId(),
                        r.getSender().getId(),
                        r.getSender().getUsername(),
                        r.getTimestamp().toString()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FriendDTO>> searchUsers(@RequestParam String query) {
        List<User> users = friendshipService.searchUsers(query);
        List<FriendDTO> dtos = users.stream()
                .map(u -> new FriendDTO(u.getId(), u.getUsername(), u.getEmail()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> unfriend(@PathVariable Long friendId, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        friendshipService.unfriend(userId, friendId);
        return ResponseEntity.ok().build();
    }
}
