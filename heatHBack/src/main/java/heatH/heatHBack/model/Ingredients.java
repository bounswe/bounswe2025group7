package heatH.heatHBack.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class Ingredients {
    @Column(name = "ingredient", nullable = false)
    String name;
    Integer quantity;
}