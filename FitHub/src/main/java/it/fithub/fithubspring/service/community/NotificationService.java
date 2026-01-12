package it.fithub.fithubspring.service.community;

import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.domain.community.Notification;
import it.fithub.fithubspring.domain.enums.NotificationType;
import it.fithub.fithubspring.repository.community.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(User user, String message, NotificationType type) {
        Notification notification = new Notification(user, message, type);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }
}
