package it.fithub.fithubspring.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}