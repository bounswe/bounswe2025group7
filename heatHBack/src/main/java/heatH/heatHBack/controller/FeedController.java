package heatH.heatHBack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.request.FeedRequest;
import heatH.heatHBack.service.implementation.FeedService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {
    private final FeedService feedService;

    @PostMapping
    public ResponseEntity<Feed> createFeed(@RequestBody FeedRequest request) {
        Feed createdFeed = feedService.createFeed(request);
        return ResponseEntity.ok(createdFeed);
    }
}
