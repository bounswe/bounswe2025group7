package heatH.heatHBack.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "recipes")
@Data
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int totalCalorie = 0;

    @ElementCollection
    @CollectionTable(name = "recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    private List<Ingredients> ingredients;

    @Column
    private String tag;

    private double price;

    @Column(nullable = false)
    private String title;

    @Column
    private String type;

    @ElementCollection
    @CollectionTable(name = "recipe_instructions", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "instruction", nullable = false)
    private List<String> instructions;

    @Column
    private String photo;

    @Column
    private double healthinessScore;

    @Column
    private double easinessScore;

    @Embedded
    private NutritionData nutritionData;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    public String getTitle() {return title;}
    public List<String> getInstructions(){return instructions;}
    public int getTotalCalorie(){return totalCalorie;}
    public double getPrice() {return price;}
}
