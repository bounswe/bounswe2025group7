package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.User;
import heatH.heatHBack.model.UserMailVerification;
import heatH.heatHBack.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.model.request.InterestFormRequest;
import heatH.heatHBack.repository.InterestFormRepository;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterestFormService {
    private final InterestFormRepository interestFormRepository;
    private final UserRepository userRepository;

    public InterestForm submitForm(InterestFormRequest request) {
        String email = getCurrentUserEmail();
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        InterestForm form = new InterestForm();
        form.setName(request.getName());
        form.setSurname(request.getSurname());
        form.setDateOfBirth(request.getDateOfBirth());
        form.setHeight(request.getHeight());
        form.setWeight(request.getWeight());
        form.setUser(user);

        // Update user's profile photo
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            user.setProfilePhoto(request.getProfilePhoto());
            userRepository.save(user);
        }

        return interestFormRepository.save(form);
    }

    public InterestForm getForm() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByUsername(email).orElse(null);
        if (user == null) {
            return null;
        }
        Optional<InterestForm> formOpt = interestFormRepository.findByUser(user);
        return formOpt.orElse(null);
    }

    public Boolean checkFirstLogin() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByUsername(email).orElse(null);

        if (user == null) {
            return false;
        }

        Optional<InterestForm> formOpt = interestFormRepository.findByUser(user);

        return formOpt.isPresent();
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        return authentication.getName();
    }
}
