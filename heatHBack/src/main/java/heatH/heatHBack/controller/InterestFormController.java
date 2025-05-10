package heatH.heatHBack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.model.request.InterestFormRequest;
import heatH.heatHBack.service.implementation.InterestFormService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/interest-form")
@RequiredArgsConstructor
public class InterestFormController {
    private final InterestFormService interestFormService;

    @PostMapping
    public ResponseEntity<InterestForm> submitForm(@RequestBody InterestFormRequest request) {
        return ResponseEntity.ok(interestFormService.submitForm(request));
    }

    @GetMapping
    public ResponseEntity<InterestForm> getForm(@PathVariable Long id) {
        InterestForm form = interestFormService.getForm(id);
        return (form != null) ? ResponseEntity.ok(form) : ResponseEntity.notFound().build();
    }
    @GetMapping("/check-first-login")
    public ResponseEntity<Boolean> checkFirstLogin(@PathVariable Long id) {
        Boolean isFirstLogin = interestFormService.checkFirstLogin(id);
        return ResponseEntity.ok(isFirstLogin);
    }
}
