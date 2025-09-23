package heatH.heatHBack.repository;
import heatH.heatHBack.model.Comment;
import heatH.heatHBack.model.Feed;
import org.springframework.data.jpa.repository.JpaRepository;

import heatH.heatHBack.model.Like;
import heatH.heatHBack.model.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Optional<Comment> findByUserAndFeedId(User user, Long feedId);
    long countByFeedId(Long feedId);

    List<Comment> findAllByFeedId(Long feedId);
    @Modifying
    @Query("DELETE FROM Comment c WHERE c.feed IN :feeds")
    void deleteAllByFeedIn(@Param("feeds") List<Feed> feeds);

}
