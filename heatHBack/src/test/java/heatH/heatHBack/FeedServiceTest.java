package heatH.heatHBack.service;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.FeedType;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.response.FeedResponse;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.LikeRepository;
import heatH.heatHBack.repository.UserRepository;
import heatH.heatHBack.service.implementation.FeedService;
import heatH.heatHBack.service.implementation.GcsService;
import heatH.heatHBack.service.implementation.RecipeService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

/**
 * Unit test for FeedService.getRecentFeedsForUser
 */
public class FeedServiceTest {

    private FeedRepository feedRepository;
    private RecipeService recipeService;
    private LikeRepository likeRepository;
    private UserRepository userRepository;
    private GcsService gcsService;

    private FeedService feedService;

    @BeforeEach
    void setUp() {
        feedRepository = mock(FeedRepository.class);
        recipeService = mock(RecipeService.class);
        likeRepository = mock(LikeRepository.class);
        userRepository = mock(UserRepository.class);
        gcsService = mock(GcsService.class);

        feedService = new FeedService(feedRepository, recipeService, likeRepository, userRepository, gcsService);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken("testuser@example.com", "password"));
        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getRecentFeedsForUser_returnsMappedResponses() {
        Long pageNumber = 0L;
        Pageable pageable = PageRequest.of(pageNumber.intValue(), 20);

        User currentUser = new User();
        currentUser.setId(100L);
        currentUser.setUsername("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(currentUser));

        User feedOwner = new User();
        feedOwner.setId(200L);
        feedOwner.setName("John");
        feedOwner.setSurname("Doe");
        feedOwner.setProfilePhoto("http://photo.example/john.png");
        when(userRepository.findById(200L)).thenReturn(Optional.of(feedOwner));

        Feed feed1 = new Feed();
        feed1.setId(1L);
        feed1.setUserId(200L);
        feed1.setType(FeedType.TEXT);
        feed1.setText("Hello World");
        feed1.setLikeCount(3);
        feed1.setCreatedAt(LocalDateTime.now());

        Feed feed2 = new Feed();
        feed2.setId(2L);
        feed2.setUserId(200L);
        feed2.setType(FeedType.TEXT);
        feed2.setText("Second Post");
        feed2.setLikeCount(5);
        feed2.setCreatedAt(LocalDateTime.now().minusMinutes(1));

        List<Feed> feeds = List.of(feed1, feed2);
        Page<Feed> page = new PageImpl<>(feeds, pageable, feeds.size());
        when(feedRepository.findAllByOrderByCreatedAtDesc(ArgumentMatchers.any(Pageable.class))).thenReturn(page);

        when(likeRepository.findByUserAndFeedId(currentUser, 1L)).thenReturn(Optional.empty());
        when(likeRepository.findByUserAndFeedId(currentUser, 2L)).thenReturn(Optional.empty());

        List<FeedResponse> responses = feedService.getRecentFeedsForUser(pageNumber);

        assertEquals(2, responses.size());
        FeedResponse r1 = responses.get(0);
        assertEquals(1L, r1.getId());
        assertEquals("Hello World", r1.getText());
        assertEquals("John", r1.getName());
        assertEquals("Doe", r1.getSurname());
        assertEquals(false, r1.isLikedByCurrentUser());
    }
}

