package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.Comment;
import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.model.request.CommentDeleteRequest;
import heatH.heatHBack.model.request.CommentRequest;
import heatH.heatHBack.model.request.GetCommentRequest;
import heatH.heatHBack.model.request.InterestFormRequest;
import heatH.heatHBack.model.response.CommentResponse;
import heatH.heatHBack.repository.CommentRepository;
import heatH.heatHBack.repository.InterestFormRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.User;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final FeedRepository feedRepository;
    private final UserRepository userRepository;
    private final InterestFormRepository interestFormRepository;

    public void commentFeed(CommentRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));


        Feed feed = feedRepository.findById(request.getFeedId()).orElseThrow();
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setFeed(feed);
        comment.setMessage(request.getMessage());
        commentRepository.save(comment);
        int currentComments = feed.getCommentCount() != null ? feed.getCommentCount() : 0;
        feed.setCommentCount(currentComments +1);
        feedRepository.save(feed);
    }

    public void deleteCommentFeed(CommentDeleteRequest request) {
        Feed feed = feedRepository.findById(request.getFeed_id()).orElseThrow();

        Comment comment = commentRepository.findById(request.getComment_id()).orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
        feed.setCommentCount(feed.getCommentCount()-1);
        feedRepository.save(feed);
    }

    public List<CommentResponse> getFeedComments(GetCommentRequest getCommentRequest) {
        List<Comment> comments = commentRepository.findAllByFeedId(getCommentRequest.getFeedId());

        return comments.stream()
                .map(comment -> {
                    CommentResponse response = new CommentResponse();
                    User user = comment.getUser();
                    InterestForm interestForm = interestFormRepository.findByUser(user).orElseThrow(() -> new RuntimeException("InterestForm not found"));
                    response.setMessage(comment.getMessage());
                    response.setCreatedAt(comment.getCreatedAt());
                    response.setName(interestForm.getName());
                    response.setSurname(interestForm.getSurname());
                    response.setProfilePhoto(user.getProfilePhoto());
                    response.setUserId(user.getId());
                    return response;
                })
                .toList();
    }
}
