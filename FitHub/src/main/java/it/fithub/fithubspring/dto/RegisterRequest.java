package it.fithub.fithubspring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    
    @JsonProperty("isAdmin")
    private Boolean isAdmin = false;

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String email, String password, Boolean isAdmin) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin != null ? isAdmin : false;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getIsAdmin() {
        return isAdmin != null ? isAdmin : false;
    }

    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin != null ? isAdmin : false;
    }
}
