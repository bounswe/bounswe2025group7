package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.Comment;
import heatH.heatHBack.model.request.CommentRequest;
import heatH.heatHBack.repository.CommentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.Feed;
import heatH.heatHBack.model.User;
import heatH.heatHBack.repository.FeedRepository;
import heatH.heatHBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final FeedRepository feedRepository;
    private final UserRepository userRepository;

    public void commentFeed(CommentRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));


        Feed feed = feedRepository.findById(request.getFeedId()).orElseThrow();
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setFeed(feed);
        commentRepository.save(comment);
        int currentComments = feed.getCommentCount() != null ? feed.getCommentCount() : 0;
        feed.setCommentCount(currentComments +1);
        feedRepository.save(feed);
    }

    public void deleteCommentFeed(CommentRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByUsername(email).orElseThrow(() -> new RuntimeException("User not found"));

        Feed feed = feedRepository.findById(request.getFeedId()).orElseThrow();

        Comment comment = commentRepository.findByUserAndFeedId(user, feed.getId()).orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
        feed.setCommentCount(feed.getCommentCount()-1);
        feedRepository.save(feed);
    }
}
