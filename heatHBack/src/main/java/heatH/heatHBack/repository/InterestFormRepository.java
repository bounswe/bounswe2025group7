package heatH.heatHBack.repository;

import heatH.heatHBack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import heatH.heatHBack.model.InterestForm;

import java.util.Optional;

public interface InterestFormRepository extends JpaRepository<InterestForm, Long> {
    Optional<InterestForm> findByUser(User user);
}
