package it.fithub.fithubspring.dto.community;

public record FriendRequestDTO(Long id, Long senderId, String senderUsername, String timestamp) {
}
