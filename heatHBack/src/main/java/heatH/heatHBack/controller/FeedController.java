package heatH.heatHBack.controller;

import java.util.List;

import heatH.heatHBack.model.Comment;
import heatH.heatHBack.model.request.*;
import heatH.heatHBack.model.response.CommentResponse;
import heatH.heatHBack.model.response.FeedProfileResponse;
import heatH.heatHBack.service.implementation.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.response.FeedResponse;
import heatH.heatHBack.service.implementation.FeedService;
import heatH.heatHBack.service.implementation.LikeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;
    private final LikeService likeService;
    private final CommentService commentService;

    @PostMapping("/created-feed")
    public ResponseEntity<Feed> createFeed(@RequestBody FeedRequest request) {
        Feed createdFeed = feedService.createFeed(request);
        return ResponseEntity.ok(createdFeed);
    }

    @PostMapping("/like")
    public ResponseEntity<?> likeFeed(@RequestBody LikeRequest request) {
        likeService.likeFeed(request);
        return ResponseEntity.ok("Feed liked");
    }

    @PostMapping("/unlike")
    public ResponseEntity<?> unlikeFeed(@RequestBody LikeRequest request) {
        likeService.unlikeFeed(request);
        return ResponseEntity.ok("Feed unliked");
    }
    @PostMapping("/comment")
    public ResponseEntity<?> commentFeed(@RequestBody CommentRequest request) {
        commentService.commentFeed(request);
        return ResponseEntity.ok("Comment added");
    }

    @PostMapping("/delete-comment")
    public ResponseEntity<?> deleteCommentFeed(@RequestBody CommentDeleteRequest request) {
        commentService.deleteCommentFeed(request);
        return ResponseEntity.ok("Comment deleted");
    }

    @GetMapping("/get-feed-comments")
    public ResponseEntity<?> getFeedComments(@RequestParam Long feedId ) {
        List<CommentResponse> comments = commentService.getFeedComments(feedId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/recent")
    public List<FeedResponse> getRecentFeedsForUser(@RequestParam Long pageNumber) {
        return feedService.getRecentFeedsForUser(pageNumber);
    }

    @GetMapping("/feed-by-user")
    public List<FeedResponse> getFeedsByUser () {
        return feedService.getFeedByUser();
    }

    @GetMapping("/other-user")
    public FeedProfileResponse getFeedOtherUser(@RequestParam Long userId){
        return feedService.getFeedOtherUser(userId);
    }
}
