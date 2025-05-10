package heatH.heatHBack.repository;

import heatH.heatHBack.model.UserMailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserVerificationRepository extends JpaRepository<UserMailVerification, Long> {
    Optional<UserMailVerification> findTopByEmailOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("DELETE FROM UserMailVerification e WHERE e.createdAt < :cutoff")
    void deleteAllOlderThan(LocalDateTime cutoff);
}
