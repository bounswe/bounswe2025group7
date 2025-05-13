package heatH.heatHBack.model.request;

import lombok.Data;

@Data
public class CommentDeleteRequest {
    private Long comment_id;
    private Long feed_id;
}
