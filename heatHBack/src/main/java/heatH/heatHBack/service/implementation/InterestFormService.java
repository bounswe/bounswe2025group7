package heatH.heatHBack.service.implementation;

import org.springframework.stereotype.Service;

import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.model.request.InterestFormRequest;
import heatH.heatHBack.repository.InterestFormRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterestFormService {
    private final InterestFormRepository interestFormRepository;

    public InterestForm submitForm(InterestFormRequest request) {
        InterestForm form = new InterestForm();
        form.setName(request.getName());
        form.setSurname(request.getSurname());
        form.setDateOfBirth(request.getDateOfBirth());
        form.setHeight(request.getHeight());
        form.setWeight(request.getWeight());

        return interestFormRepository.save(form);
    }

    public InterestForm getForm(Long id) {
        return interestFormRepository.findById(id).orElse(null);
    }

    public Boolean checkFirstLogin(Long id){
        InterestForm form = interestFormRepository.findById(id).orElse(null);
        if (form != null) {
            return true;
        } else {
            return false;
        }
    }
}
