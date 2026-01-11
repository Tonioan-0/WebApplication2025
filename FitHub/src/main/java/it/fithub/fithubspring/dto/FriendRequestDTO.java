package it.fithub.fithubspring.dto;

public record FriendRequestDTO(Long id, Long senderId, String senderUsername, String timestamp) {
}
