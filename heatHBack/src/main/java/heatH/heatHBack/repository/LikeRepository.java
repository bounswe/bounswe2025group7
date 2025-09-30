package heatH.heatHBack.repository;

import heatH.heatHBack.model.Feed;
import org.springframework.data.jpa.repository.JpaRepository;

import heatH.heatHBack.model.Like;
import heatH.heatHBack.model.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndFeedId(User user, Long feedId);
    long countByFeedId(Long feedId);
    @Modifying
    @Query("DELETE FROM Like l WHERE l.feed IN :feeds")
    void deleteAllByFeedIn(@Param("feeds") List<Feed> feeds);
}