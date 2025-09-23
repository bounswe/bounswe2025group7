package heatH.heatHBack.model.request;

import lombok.Data;

@Data
public class FeedRequest {
    private String text;         
    private String image;     
    private Long recipeId;       
    private String type;
          
}
