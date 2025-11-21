package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.Comment;
import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.CommentDeleteRequest;
import heatH.heatHBack.model.request.CommentRequest;
import heatH.heatHBack.model.response.CommentResponse;
import heatH.heatHBack.repository.CommentRepository;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.InterestFormRepository;
import heatH.heatHBack.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private FeedRepository feedRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InterestFormRepository interestFormRepository;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void commentFeed_persistsCommentAndUpdatesFeedCount() {
        CommentRequest request = new CommentRequest();
        request.setFeedId(5L);
        request.setMessage("Looks delicious!");

        User user = new User();
        user.setUsername("user@example.com");
        when(authentication.getName()).thenReturn(user.getUsername());
        when(userRepository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));

        Feed feed = new Feed();
        feed.setId(5L);
        feed.setCommentCount(1);
        when(feedRepository.findById(request.getFeedId())).thenReturn(Optional.of(feed));

        commentService.commentFeed(request);

        ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(commentCaptor.capture());
        Comment savedComment = commentCaptor.getValue();
        assertEquals(user, savedComment.getUser());
        assertEquals(feed, savedComment.getFeed());
        assertEquals("Looks delicious!", savedComment.getMessage());

        assertEquals(2, feed.getCommentCount());
        verify(feedRepository).save(feed);
    }

    @Test
    void deleteCommentFeed_removesCommentAndDecrementsCounter() {
        CommentDeleteRequest request = new CommentDeleteRequest();
        request.setFeed_id(10L);
        request.setComment_id(42L);

        Feed feed = new Feed();
        feed.setCommentCount(3);
        when(feedRepository.findById(request.getFeed_id())).thenReturn(Optional.of(feed));

        Comment comment = new Comment();
        comment.setId(42L);
        when(commentRepository.findById(request.getComment_id())).thenReturn(Optional.of(comment));

        commentService.deleteCommentFeed(request);

        verify(commentRepository).delete(comment);
        assertEquals(2, feed.getCommentCount());
        verify(feedRepository).save(feed);
    }

    @Test
    void getFeedComments_returnsMappedResponses() {
        Long feedId = 7L;
        User user = new User();
        user.setId(3L);
        user.setProfilePhoto("profile.png");

        Comment comment = new Comment();
        comment.setId(9L);
        comment.setMessage("Great tip!");
        LocalDateTime createdAt = LocalDateTime.now();
        comment.setCreatedAt(createdAt);
        comment.setUser(user);

        when(commentRepository.findAllByFeedId(feedId)).thenReturn(List.of(comment));

        InterestForm interestForm = new InterestForm();
        interestForm.setName("Jane");
        interestForm.setSurname("Doe");
        interestForm.setUser(user);
        when(interestFormRepository.findByUser(user)).thenReturn(Optional.of(interestForm));

        List<CommentResponse> responses = commentService.getFeedComments(feedId);

        assertEquals(1, responses.size());
        CommentResponse response = responses.get(0);
        assertEquals(comment.getId(), response.getId());
        assertEquals("Jane", response.getName());
        assertEquals("Doe", response.getSurname());
        assertEquals("profile.png", response.getProfilePhoto());
        assertEquals("Great tip!", response.getMessage());
        assertEquals(createdAt, response.getCreatedAt());
        assertEquals(user.getId(), response.getUserId());
    }
}
