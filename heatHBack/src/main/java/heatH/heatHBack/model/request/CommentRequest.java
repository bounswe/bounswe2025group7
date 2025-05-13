package heatH.heatHBack.model.request;

import lombok.Data;

@Data
public class CommentRequest {
    private Long feedId;
    private String message;
}
