package it.fithub.fithubspring.dto.community;

import java.time.LocalDateTime;

public record AppointmentDTO(Long id, String title, String type, String location, LocalDateTime dateTime,
                String creatorUsername) {
}
