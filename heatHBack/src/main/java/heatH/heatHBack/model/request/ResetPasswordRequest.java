package heatH.heatHBack.model.request;


import lombok.Data;


@Data

public class ResetPasswordRequest {
    private String email;
    private String newPassword;
}