package it.fithub.fithubspring.dto;

import java.time.LocalDateTime;

public record AppointmentRequest(String title, String type, String location, LocalDateTime dateTime) {
}
