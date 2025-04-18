package heatH.heatHBack.service;

import heatH.heatHBack.model.request.LoginRequest;
import heatH.heatHBack.model.request.RegisterRequest;

public interface IAuthService {
    String register(RegisterRequest request);
    String login(LoginRequest request);
}
