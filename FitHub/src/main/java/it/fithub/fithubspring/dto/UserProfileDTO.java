package it.fithub.fithubspring.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class UserProfileDTO {
    private String username;
    private String email;
    private Boolean isPublic;
}