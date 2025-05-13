package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.User;
import heatH.heatHBack.model.UserMailVerification;
import heatH.heatHBack.model.request.LoginRequest;
import heatH.heatHBack.model.request.RegisterRequest;
import heatH.heatHBack.model.request.ResetPasswordRequest;
import heatH.heatHBack.model.request.VerificationRequest;
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
import java.time.ZoneOffset;
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
        // Build a cool HTML email template for verification
        String htmlBody = "<p>Welcome to <strong>HeatH</strong>!</p>" +
            "<p>Your verification code is:</p>" +
            "<div class=\"code\">" + verificationCode + "</div>";
        mailService.sendEmail(email, "HeatH Verification Code", htmlBody);

        userVerificationRepository.save(new UserMailVerification(email, verificationCode));

        return "Mail has send";
    }

    @Override
    public Boolean verifyCode(VerificationRequest verificationRequest) {
        String email = verificationRequest.getEmail();
        Integer code = verificationRequest.getCode();

        Optional<UserMailVerification> recordOpt = userVerificationRepository
                .findByEmailAndCode(email, code);

        if (recordOpt.isEmpty()) return false;

        return true;
    }

    @Scheduled(fixedRate = 300_000)
    public void cleanupExpiredCodes() {
        LocalDateTime cutoff = LocalDateTime.now(ZoneOffset.UTC).minusMinutes(5);
        userVerificationRepository.deleteAllOlderThan(cutoff);
    }

    public boolean exists(String email) {
        return userRepository.existsByUsername(email);
    }

    @Override
    public Boolean resetPassword(ResetPasswordRequest request) {
        // Find the user by email
        Optional<User> userOptional = userRepository.findByUsername(request.getEmail());
        
        if (userOptional.isEmpty()) {
            return false;
        }
        
        User user = userOptional.get();
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return true;
    }

}

