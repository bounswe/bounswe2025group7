package heatH.heatHBack.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "recipes")
@Data
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int totalCalorie = 0;

    @Column(nullable = false)
    private List<String> ingredients;

    @Column
    private String tag;

    private double price;

    @Column(nullable = false)
    private String title;

    @Column
    private String type;

    @Column(nullable = false)
    private List<String> instructions;

    @Column
    private String photo;

    @Column
    private double healthinessScore;

    @Column
    private double easinessScore;

    @Column(name = "id", nullable = false)
    private Long userId;

    public String getTitle() {return title;}
    public List<String> getInstructions(){return instructions;}
    public int getTotalCalorie(){return totalCalorie;}
    public double getPrice() {return price;}


}
