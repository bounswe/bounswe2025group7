package heatH.heatHBack.service.implementation;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.FeedType;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.FeedRequest;
import heatH.heatHBack.model.response.FeedResponse;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.LikeRepository;
import heatH.heatHBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final FeedRepository feedRepository;
    private final RecipeService recipeService;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final GcsService gcsService;


    public Feed createFeed(FeedRequest request) {
        FeedType type = FeedType.valueOf(request.getType());
        Feed feed = new Feed();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        feed.setUserId(user.getId());
        feed.setCreatedAt(LocalDateTime.now(ZoneId.of("Europe/Istanbul")));
        feed.setType(type);
        feed.setLikeCount(0);

        switch (type) {
            case TEXT -> feed.setText(request.getText());

            case IMAGE_AND_TEXT -> {
                feed.setText(request.getText());

                String fileName = "user-profile-" + UUID.randomUUID() + ".jpg";
                String imageUrl = gcsService.uploadBase64Image(request.getImage(), fileName);
                feed.setImage(imageUrl);
            }

            case RECIPE -> {
                Recipe recipe = recipeService.getRecipeById(request.getRecipeId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
                feed.setRecipe(recipe);
                feed.setText(request.getText());
                String fileName = "user-profile-" + UUID.randomUUID() + ".jpg";
                String imageUrl = gcsService.uploadBase64Image(request.getImage(), fileName);
                feed.setImage(imageUrl);
            }

            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid feed type");
        }

        return feedRepository.save(feed);
    }

    public List<FeedResponse> getRecentFeedsForUser() {
        // Fetch last 20 feeds sorted by createdAt DESC
        List<Feed> feeds = feedRepository.findTop20ByOrderByCreatedAtDesc();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return feeds.stream().map(feed -> {
            Recipe recipe = feed.getRecipe();
            FeedResponse response = new FeedResponse();
            response.setId(feed.getId());
            response.setText(feed.getText());
            response.setUserId(feed.getUserId());
            response.setType(feed.getType());
            response.setCreatedAt(feed.getCreatedAt());
            response.setLikeCount(feed.getLikeCount());
            response.setRecipe(recipe);
            response.setImage(feed.getImage());

            // Check if this feed is liked by the user
            boolean liked = likeRepository.findByUserAndFeedId(user, feed.getId()).isPresent();
            response.setLikedByCurrentUser(liked);

            return response;
        }).toList();
    }

    public List<FeedResponse> getFeedByUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Feed> feeds = feedRepository.findByUserId(user.getId());

        return feeds.stream().map(feed -> {
            FeedResponse response = new FeedResponse();
            response.setId(feed.getId());
            response.setText(feed.getText());
            response.setUserId(feed.getUserId());
            response.setType(feed.getType());
            response.setCreatedAt(feed.getCreatedAt());
            response.setLikeCount(feed.getLikeCount());

            return response;
        }).toList();
    }
}
