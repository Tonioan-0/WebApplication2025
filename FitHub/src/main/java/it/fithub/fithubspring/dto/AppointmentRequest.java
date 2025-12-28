package it.fithub.fithubspring.dto;

import java.time.LocalDateTime;

public record AppointmentRequest(String location, LocalDateTime dateTime) {
}
