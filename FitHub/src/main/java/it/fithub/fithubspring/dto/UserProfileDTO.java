package it.fithub.fithubspring.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class UserProfileDTO {
    private String username;
    private String email;
    private Boolean isPublic;
    private Integer streak;
    private Integer weeklyWorkouts;
    private String statusMessage;
}