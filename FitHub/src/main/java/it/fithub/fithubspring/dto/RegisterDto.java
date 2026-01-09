package it.fithub.fithubspring.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDto {
    private String fullName; // Mapped to username for now, or separate if splitting names
    private String email;
    private String password;
}
