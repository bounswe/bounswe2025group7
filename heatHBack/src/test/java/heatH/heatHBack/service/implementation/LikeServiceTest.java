package heatH.heatHBack.service.implementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.Like;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.LikeRequest;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.LikeRepository;
import heatH.heatHBack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class LikeServiceTest {
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private FeedRepository feedRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LikeService likeService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unlikeFeed_deletesLikeAndDecrementsFeedLikeCount() {
        // arrange
        long feedId = 10L;
        String username = "test@example.com";

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(username);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        User user = new User();

        Feed feed = mock(Feed.class);
        when(feed.getId()).thenReturn(feedId);
        when(feed.getLikeCount()).thenReturn(5);

        Like like = new Like();
        like.setUser(user);
        like.setFeed(feed);

        LikeRequest request = new LikeRequest();
        request.setFeedId(feedId);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(feedRepository.findById(feedId)).thenReturn(Optional.of(feed));
        when(likeRepository.findByUserAndFeedId(user, feedId)).thenReturn(Optional.of(like));

        // act
        likeService.unlikeFeed(request);

        // assert
        verify(likeRepository).delete(like);
        verify(feed).setLikeCount(4);
        verify(feedRepository).save(feed);
    }

    @Test
    void unlikeFeed_throwsWhenLikeNotFound() {
        // arrange
        long feedId = 42L;
        String username = "user@example.com";

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(username);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        User user = new User();
        Feed feed = mock(Feed.class);
        when(feed.getId()).thenReturn(feedId);

        LikeRequest request = new LikeRequest();
        request.setFeedId(feedId);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(feedRepository.findById(feedId)).thenReturn(Optional.of(feed));
        when(likeRepository.findByUserAndFeedId(user, feedId)).thenReturn(Optional.empty());

        // act + assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> likeService.unlikeFeed(request));
        assertEquals("Like not found", ex.getMessage());
        verify(likeRepository, never()).delete(any());
        verify(feedRepository, never()).save(any());
    }
}


