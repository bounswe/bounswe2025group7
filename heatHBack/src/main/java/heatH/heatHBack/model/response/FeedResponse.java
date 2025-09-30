package heatH.heatHBack.model.response;

import java.time.LocalDateTime;

import heatH.heatHBack.model.FeedType;
import heatH.heatHBack.model.Recipe;
import lombok.Data;

@Data
public class FeedResponse {
    private Long id;
    private Long userId;
    private FeedType type;
    private String text;
    private String image;
    private Recipe recipe;
    private LocalDateTime createdAt;
    private Integer likeCount;
    private Integer commentCount;
    private boolean likedByCurrentUser;
    private String name;
    private String surname;
    private String profilePhoto;
}
