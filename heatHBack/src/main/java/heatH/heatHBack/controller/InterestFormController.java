package heatH.heatHBack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.model.request.InterestFormRequest;
import heatH.heatHBack.service.implementation.InterestFormService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/interest-form")
@RequiredArgsConstructor
public class InterestFormController {
    private final InterestFormService interestFormService;

    @PostMapping("/submit")
    public ResponseEntity<InterestForm> submitForm(@RequestBody InterestFormRequest request) {
        return ResponseEntity.ok(interestFormService.submitForm(request));
    }

    @GetMapping("/get-form")
    public ResponseEntity<InterestForm> getForm() {
        InterestForm form = interestFormService.getForm();
        return (form != null) ? ResponseEntity.ok(form) : ResponseEntity.notFound().build();
    }
    @GetMapping("/check-first-login")
    public ResponseEntity<Boolean> checkFirstLogin() {
        Boolean isFirstLogin = interestFormService.checkFirstLogin();
        return ResponseEntity.ok(isFirstLogin);
    }

    @PutMapping("/update-form")
    public ResponseEntity<InterestForm> updateForm(@RequestBody InterestFormRequest request) {
        InterestForm updatedForm = interestFormService.updateForm(request);
        return ResponseEntity.ok(updatedForm);
    }
}
