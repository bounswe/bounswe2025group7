package heatH.heatHBack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.request.FeedRequest;
import heatH.heatHBack.model.request.LikeRequest;
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

    @PostMapping
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

    @GetMapping("/recent")
    public List<FeedResponse> getRecentFeedsForUser() {
        return feedService.getRecentFeedsForUser();
    }

    
}
