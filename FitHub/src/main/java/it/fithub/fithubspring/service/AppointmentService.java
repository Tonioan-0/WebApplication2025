package it.fithub.fithubspring.service;

import it.fithub.fithubspring.domain.Appointment;
import it.fithub.fithubspring.domain.User;
import it.fithub.fithubspring.domain.enums.NotificationType;
import it.fithub.fithubspring.exception.UserNotFoundException;
import it.fithub.fithubspring.repository.AppointmentRepository;
import it.fithub.fithubspring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FriendshipService friendshipService;

    public AppointmentService(AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            FriendshipService friendshipService) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.friendshipService = friendshipService;
    }

    public void createAppointment(Long userId, String location, LocalDateTime dateTime) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Appointment appointment = new Appointment(location, dateTime, creator);
        appointmentRepository.save(appointment);

        // Optional: Notify all friends
        List<User> friends = friendshipService.getFriends(userId);
        String notificationMessage = creator.getUsername() + " has created a new appointment at " + location + ".";
        for (User friend : friends) {
            notificationService.createNotification(friend, notificationMessage, NotificationType.NEW_APPOINTMENT);
        }
    }
}
