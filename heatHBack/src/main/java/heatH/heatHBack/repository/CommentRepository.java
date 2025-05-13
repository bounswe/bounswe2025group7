package heatH.heatHBack.repository;
import heatH.heatHBack.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import heatH.heatHBack.model.Like;
import heatH.heatHBack.model.User;

import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Optional<Comment> findByUserAndFeedId(User user, Long feedId);
    long countByFeedId(Long feedId);
}
