package it.fithub.fithubspring.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Blacklist {
    private Long id;
    private Long userId;
    private String email;
    private String reason;
    private LocalDateTime bannedAt;
    private Long bannedBy;
}
