package it.fithub.fithubspring.service.community;

import it.fithub.fithubspring.domain.User;

import it.fithub.fithubspring.domain.community.Appointment;
import it.fithub.fithubspring.dto.community.AppointmentDTO;
import it.fithub.fithubspring.exception.UserNotFoundException;
import it.fithub.fithubspring.repository.community.AppointmentRepository;
import it.fithub.fithubspring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
            UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    public void createAppointment(Long userId, String title, String type, String location, LocalDateTime dateTime) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Appointment appointment = new Appointment(title, type, location, dateTime, creator);
        appointmentRepository.save(appointment);
    }

    public List<AppointmentDTO> getUserAppointments(Long userId) {
        return appointmentRepository.findByCreatorId(userId).stream()
                .map(this::toDTO)
                .toList();
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

    private AppointmentDTO toDTO(Appointment appointment) {
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getTitle(),
                appointment.getType(),
                appointment.getLocation(),
                appointment.getDateTime(),
                appointment.getCreator().getUsername());
    }
}
