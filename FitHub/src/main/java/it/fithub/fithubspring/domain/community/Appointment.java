package it.fithub.fithubspring.domain.community;

import it.fithub.fithubspring.domain.User;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class Appointment {

    private Long id;
    private String title;
    private String type;
    private String location;
    private LocalDateTime dateTime;
    private User creator;

    public Appointment(String title, String type, String location, LocalDateTime dateTime, User creator) {
        this.title = title;
        this.type = type;
        this.location = location;
        this.dateTime = dateTime;
        this.creator = creator;
    }
}
