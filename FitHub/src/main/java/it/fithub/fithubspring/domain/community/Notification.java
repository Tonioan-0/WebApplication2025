package it.fithub.fithubspring.domain.community;
import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.domain.enums.NotificationType;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class Notification {

    private Long id;
    private User user;
    private String message;
    private NotificationType type;
    private boolean isRead = false;
    private LocalDateTime timestamp;

    public Notification(User user, String message, NotificationType type) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }
}
