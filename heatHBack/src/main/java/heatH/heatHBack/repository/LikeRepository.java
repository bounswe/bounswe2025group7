package heatH.heatHBack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import heatH.heatHBack.model.Like;
import heatH.heatHBack.model.User;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndFeedId(User user, Long feedId);
    long countByFeedId(Long feedId);
}