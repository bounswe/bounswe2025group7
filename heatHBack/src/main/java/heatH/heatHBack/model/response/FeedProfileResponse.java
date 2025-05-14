package heatH.heatHBack.model.response;

import java.time.LocalDateTime;
import java.util.List;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.FeedType;
import heatH.heatHBack.model.Recipe;
import lombok.Data;

@Data
public class FeedProfileResponse {
    private String name;
    private String surname;
    private String profilePhoto;
    private List<Feed> feeds;

}
