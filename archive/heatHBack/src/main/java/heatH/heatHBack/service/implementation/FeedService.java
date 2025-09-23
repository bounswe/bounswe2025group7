package heatH.heatHBack.service.implementation;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import heatH.heatHBack.model.response.FeedProfileResponse;
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
            }

            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid feed type");
        }

        return feedRepository.save(feed);
    }

    public List<FeedResponse> getRecentFeedsForUser(Long pageNumber) {
        int pageSize = 20;
        Pageable pageable = PageRequest.of(pageNumber.intValue(), pageSize, Sort.by("createdAt").descending());

        Page<Feed> feedPage = feedRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<Feed> feeds = feedPage.getContent();

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
            response.setCommentCount(feed.getCommentCount());
            if(feed.getImage() != null) {
                response.setImage(feed.getImage());
            }
            User user2 = userRepository.findById(feed.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
            response.setName(user2.getName());
            response.setSurname(user2.getSurname());
            response.setProfilePhoto(user2.getProfilePhoto());
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
            Recipe recipe = feed.getRecipe();
            response.setId(feed.getId());
            response.setText(feed.getText());
            response.setUserId(feed.getUserId());
            response.setType(feed.getType());
            response.setCreatedAt(feed.getCreatedAt());
            response.setLikeCount(feed.getLikeCount());
            response.setRecipe(recipe);
            if(feed.getImage() != null) {
                response.setImage(feed.getImage());
            }

            boolean liked = likeRepository.findByUserAndFeedId(user, feed.getId()).isPresent();
            response.setLikedByCurrentUser(liked);
            return response;
        }).toList();
    }
    
    public FeedProfileResponse getFeedOtherUser(Long userId){
        List<Feed> feeds = feedRepository.findByUserId(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Feed> feedResponses = feeds.stream().map(feed -> {
            Feed response = new Feed();
            response.setId(feed.getId());
            response.setText(feed.getText());
            response.setUserId(feed.getUserId());
            response.setType(feed.getType());
            response.setCreatedAt(feed.getCreatedAt());
            response.setLikeCount(feed.getLikeCount());
            response.setRecipe(feed.getRecipe());
            if(feed.getImage() != null) {
                response.setImage(feed.getImage());
            }
            return response;
        }).toList();

        FeedProfileResponse feedProfileResponse = new FeedProfileResponse();
        feedProfileResponse.setName(user.getName());
        feedProfileResponse.setSurname(user.getSurname());
        feedProfileResponse.setProfilePhoto(user.getProfilePhoto());
        feedProfileResponse.setFeeds(feedResponses);

        return feedProfileResponse;
    }
}
