package heatH.heatHBack.service;

import heatH.heatHBack.model.request.LoginRequest;
import heatH.heatHBack.model.request.RegisterRequest;
import heatH.heatHBack.model.request.ResetPasswordRequest;
import heatH.heatHBack.model.request.VerificationRequest;
import heatH.heatHBack.model.response.AuthResponse;



public interface IAuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    String sendVerificationCode(String email);
    Boolean verifyCode(VerificationRequest verificationRequest);
    Boolean resetPassword(ResetPasswordRequest request);
}

