package heatH.heatHBack.service.implementation;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.Like;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.LikeRequest;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.LikeRepository;
import heatH.heatHBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final FeedRepository feedRepository;
    private final UserRepository userRepository;

    public void likeFeed(LikeRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));
                

        Feed feed = feedRepository.findById(request.getFeedId()).orElseThrow();
        Like like = new Like();
        like.setUser(user);
        like.setFeed(feed);
        likeRepository.save(like);
        int currentLikes = feed.getLikeCount() != null ? feed.getLikeCount() : 0;
        feed.setLikeCount(currentLikes + 1);
        feed.setLikedByCurrentUser(true);
        feedRepository.save(feed);
    }

    public void unlikeFeed(LikeRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));

        Feed feed = feedRepository.findById(request.getFeedId()).orElseThrow();

        Like like = likeRepository.findByUserAndFeedId(user, feed.getId()).orElseThrow(() -> new RuntimeException("Like not found"));

        likeRepository.delete(like);
        feed.setLikeCount(feed.getLikeCount() - 1);
        feed.setLikedByCurrentUser(false);
        feedRepository.save(feed);
    }
    
}
