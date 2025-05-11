package heatH.heatHBack.controller;

import heatH.heatHBack.model.request.*;
import heatH.heatHBack.model.response.AuthResponse;
import heatH.heatHBack.service.implementation.AuthService;
import heatH.heatHBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }
    @PostMapping("/send-verification-code")
    public ResponseEntity<String> sendVerificationCode(@RequestBody EmailRequest emailRequest) {
        return ResponseEntity.ok(authService.sendVerificationCode(emailRequest.getEmail()));
    }
    @PostMapping("/verify-code")
    public ResponseEntity<Boolean> verifyCode(@RequestBody VerificationRequest verificationRequest) {
        return ResponseEntity.ok(authService.verifyCode(verificationRequest));
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> exists(@RequestParam String email) {
        return ResponseEntity.ok(authService.exists(email));
    }

}
