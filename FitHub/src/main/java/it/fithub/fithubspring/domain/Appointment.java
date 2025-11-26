package it.fithub.fithubspring.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Appointment entity - pure POJO without JPA annotations.
 */
@Data
@NoArgsConstructor
public class Appointment {

    private Long id;
    private String location;
    private LocalDateTime dateTime;
    private User creator;

    public Appointment(String location, LocalDateTime dateTime, User creator) {
        this.location = location;
        this.dateTime = dateTime;
        this.creator = creator;
    }
}
