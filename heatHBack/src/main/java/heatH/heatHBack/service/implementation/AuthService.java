package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.User;
import heatH.heatHBack.model.UserMailVerification;
import heatH.heatHBack.model.request.LoginRequest;
import heatH.heatHBack.model.request.RegisterRequest;
import heatH.heatHBack.model.response.AuthResponse;
import heatH.heatHBack.repository.UserRepository;
import heatH.heatHBack.repository.UserVerificationRepository;
import heatH.heatHBack.service.IAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;
    private final UserVerificationRepository userVerificationRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.username);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole("USER");

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username, request.password)
        );

        User user = userRepository.findByUsername(request.username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!refreshToken.equals(user.getRefreshToken()) || !jwtService.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public String sendVerificationCode(String email) {
        Integer verificationCode = (int) (Math.random() * 900000) + 100000;

        mailService.sendEmail(email, "Verification Code", "Your verification code is: " + verificationCode);

        userVerificationRepository.save(new UserMailVerification(email, verificationCode));

        return "Mail has send";
    }

    @Override
    public Boolean verifyCode(Integer code) {
        String email = getCurrentUserEmail();

        Optional<UserMailVerification> recordOpt = userVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(email);

        if (recordOpt.isEmpty()) return false;

        UserMailVerification record = recordOpt.get();

        if (record.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(5))) {
            return false;
        }

        return record.getCode().equals(code);
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        return authentication.getName();
    }

    @Scheduled(fixedRate = 600_000)
    public void cleanupExpiredCodes() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        userVerificationRepository.deleteAllOlderThan(cutoff);
    }

}

