package heatH.heatHBack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import heatH.heatHBack.model.Feed;

public interface FeedRepository extends JpaRepository<Feed, Long> {
    List<Feed> findByUserId(Long userId);

    List<Feed> findTop20ByOrderByCreatedAtDesc();

    List<Feed> findByRecipeId(Long recipeId);

    Page<Feed> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
