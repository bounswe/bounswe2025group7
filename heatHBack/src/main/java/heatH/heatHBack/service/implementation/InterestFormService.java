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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterestFormService {
    private final InterestFormRepository interestFormRepository;
    private final UserRepository userRepository;
    private final GcsService gcsService;

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
        form.setGender(request.getGender());

        if (request.getProfilePhoto() != null) {
            String fileName = "user-profile-" + UUID.randomUUID() + ".jpg";
            String imageUrl = gcsService.uploadBase64Image(request.getProfilePhoto(), fileName);
            form.setProfilePhoto(imageUrl);
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

    public InterestForm updateForm(InterestFormRequest request) {
        String email = getCurrentUserEmail(); // You should implement this
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InterestForm form = interestFormRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("InterestForm not found"));

        if (request.getName() != null) {
            form.setName(request.getName());
        }
        if (request.getSurname() != null) {
            form.setSurname(request.getSurname());
        }
        if (request.getDateOfBirth() != null) {
            form.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getHeight() != null) {
            form.setHeight(request.getHeight());
        }
        if (request.getWeight() != null) {
            form.setWeight(request.getWeight());
        }
        if (request.getProfilePhoto() != null) {
            String fileName = "user-profile-" + UUID.randomUUID() + ".jpg";
            String imageUrl = gcsService.uploadBase64Image(request.getProfilePhoto(), fileName);
            form.setProfilePhoto(imageUrl);
        }
        if (request.getGender() != null) {
            form.setGender(request.getGender());
        }
        return interestFormRepository.save(form);
    }

}
