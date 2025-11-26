package it.fithub.fithubspring.domain;

import it.fithub.fithubspring.domain.enums.FriendRequestStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * FriendRequest entity - pure POJO without JPA annotations.
 */
@Data
@NoArgsConstructor
public class FriendRequest {

    private Long id;
    private User sender;
    private User receiver;
    private FriendRequestStatus status;
    private LocalDateTime timestamp;

    public FriendRequest(User sender, User receiver) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = FriendRequestStatus.PENDING;
        this.timestamp = LocalDateTime.now();
    }
}
