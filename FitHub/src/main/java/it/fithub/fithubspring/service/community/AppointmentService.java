package it.fithub.fithubspring.service.community;

import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.domain.community.Appointment;
import it.fithub.fithubspring.dto.community.AppointmentDTO;
import it.fithub.fithubspring.exception.UserNotFoundException;
import it.fithub.fithubspring.repository.community.AppointmentRepository;
import it.fithub.fithubspring.repository.community.AppointmentConfirmationRepository;
import it.fithub.fithubspring.repository.community.FriendRequestRepository;
import it.fithub.fithubspring.repository.UserRepository;
import it.fithub.fithubspring.domain.enums.FriendRequestStatus;
import it.fithub.fithubspring.domain.enums.NotificationType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentConfirmationRepository confirmationRepository;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final NotificationService notificationService;
    private final ThreadLocal<Long> currentUserId = new ThreadLocal<>();

    public AppointmentService(AppointmentRepository appointmentRepository,
            AppointmentConfirmationRepository confirmationRepository,
            UserRepository userRepository,
            FriendRequestRepository friendRequestRepository,
            NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.confirmationRepository = confirmationRepository;
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.notificationService = notificationService;
    }

    public void createAppointment(Long userId, String title, String type, String location, LocalDateTime dateTime) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Appointment appointment = new Appointment(title, type, location, dateTime, creator);
        appointmentRepository.save(appointment);

        // Notify all friends about the new appointment
        List<User> friends = getFriends(creator);
        String message = creator.getUsername() + " ha creato un nuovo appuntamento: " + title;
        for (User friend : friends) {
            notificationService.createNotification(friend, message, NotificationType.NEW_APPOINTMENT);
        }
    }

    private List<User> getFriends(User user) {
        List<User> friendsFromSent = friendRequestRepository.findUsersWhoReceivedRequestsFrom(user,
                FriendRequestStatus.ACCEPTED);
        List<User> friendsFromReceived = friendRequestRepository.findUsersWhoSentRequestsTo(user,
                FriendRequestStatus.ACCEPTED);
        return Stream.concat(friendsFromSent.stream(), friendsFromReceived.stream()).toList();
    }

    public List<AppointmentDTO> getUserAppointments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        // Get friends (both directions)
        List<User> friendsFromSent = friendRequestRepository.findUsersWhoReceivedRequestsFrom(user,
                FriendRequestStatus.ACCEPTED);
        List<User> friendsFromReceived = friendRequestRepository.findUsersWhoSentRequestsTo(user,
                FriendRequestStatus.ACCEPTED);

        // Collect all IDs: user + friends
        List<Long> allIds = new ArrayList<>();
        allIds.add(userId);
        friendsFromSent.forEach(f -> allIds.add(f.getId()));
        friendsFromReceived.forEach(f -> allIds.add(f.getId()));

        // Set current user for toDTO
        currentUserId.set(userId);
        try {
            return appointmentRepository.findByCreatorIdIn(allIds).stream()
                    .map(this::toDTO)
                    .toList();
        } finally {
            currentUserId.remove();
        }
    }

    public void updateAppointment(Long id, Long userId, String title, String type, String location,
            LocalDateTime dateTime) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this appointment");
        }

        appointment.setTitle(title);
        appointment.setType(type);
        appointment.setLocation(location);
        appointment.setDateTime(dateTime);
        appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id, Long userId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this appointment");
        }

        appointmentRepository.deleteById(id);
    }

    public void confirmAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Cannot confirm your own appointment
        if (appointment.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Cannot confirm your own appointment");
        }

        confirmationRepository.confirm(appointmentId, userId);

        // Notify the creator that someone confirmed
        User confirmingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String message = confirmingUser.getUsername() + " ha confermato la partecipazione a: " + appointment.getTitle();
        notificationService.createNotification(appointment.getCreator(), message, NotificationType.NEW_APPOINTMENT);
    }

    private AppointmentDTO toDTO(Appointment appointment) {
        Long userId = currentUserId.get();
        boolean isOwner = userId != null && appointment.getCreator().getId().equals(userId);
        boolean isConfirmed = userId != null && confirmationRepository.isConfirmed(appointment.getId(), userId);
        int confirmedCount = confirmationRepository.countConfirmations(appointment.getId());

        return new AppointmentDTO(
                appointment.getId(),
                appointment.getTitle(),
                appointment.getType(),
                appointment.getLocation(),
                appointment.getDateTime(),
                appointment.getCreator().getUsername(),
                isOwner,
                isConfirmed,
                confirmedCount);
    }
}
