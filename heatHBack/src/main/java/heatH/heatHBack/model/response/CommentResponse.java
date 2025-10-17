package heatH.heatHBack.model.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String name;
    private String surname;
    private String profilePhoto;
    private String message;
    private LocalDateTime createdAt;
    private Long userId;
}
