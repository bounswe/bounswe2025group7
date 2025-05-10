package heatH.heatHBack.model.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InterestFormRequest {
    private String name;
    private String surname;
    private LocalDate dateOfBirth;
    private Integer height;
    private Double weight;
}
