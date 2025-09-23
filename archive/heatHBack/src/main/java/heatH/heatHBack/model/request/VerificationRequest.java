package heatH.heatHBack.model.request;

import lombok.Data;

@Data

public class VerificationRequest {
    private String email;
    private Integer code;

}
