package heatH.heatHBack.service.implementation;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.FeedType;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.FeedRequest;
import heatH.heatHBack.repository.FeedRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final FeedRepository feedRepository;
    private final RecipeService recipeService;

    public Feed createFeed(FeedRequest request) {
        FeedType type = FeedType.valueOf(request.getType());
        Feed feed = new Feed();

        feed.setUserId(request.getUserId());
        feed.setCreatedAt(LocalDateTime.now());
        feed.setType(type);

        switch (type) {
            case TEXT -> feed.setText(request.getText());

            case IMAGE_AND_TEXT -> {
                feed.setText(request.getText());
                feed.setImage(request.getImage());
            }

            case RECIPE -> {
                Recipe recipe = recipeService.getRecipeById(request.getRecipeId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
                feed.setRecipe(recipe);
            }

            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid feed type");
        }

        return feedRepository.save(feed);
    }
}
