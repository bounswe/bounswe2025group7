package heatH.heatHBack.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class Ingredients {
    String name;
    Integer quantity;
}
