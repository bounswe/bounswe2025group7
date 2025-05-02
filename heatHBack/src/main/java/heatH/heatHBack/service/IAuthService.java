package heatH.heatHBack.service;

import heatH.heatHBack.model.request.LoginRequest;
import heatH.heatHBack.model.request.RegisterRequest;
import heatH.heatHBack.model.response.AuthResponse;

public interface IAuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
}
