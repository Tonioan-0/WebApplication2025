package it.fithub.fithubspring.dto.community;

import java.time.LocalDateTime;

public record AppointmentRequest(String title, String type, String location, LocalDateTime dateTime) {
}
