package com.enterprise.api.auth.service;

import com.enterprise.api.auth.model.dto.AuthDTO;
import com.enterprise.api.auth.model.entity.User;
import com.enterprise.api.auth.repository.UserRepository;
import com.enterprise.api.auth.security.JwtProvider;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDTO.TokenResponse login(AuthDTO.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        user.setLastLogin(LocalDateTime.now());

        String accessToken = jwtProvider.generateToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("User {} logged in", user.getUsername());
        return new AuthDTO.TokenResponse(accessToken, refreshToken, jwtProvider.getExpiration(), toUserInfo(user));
    }

    @Transactional
    public AuthDTO.TokenResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Username already taken", HttpStatus.CONFLICT, "USERNAME_TAKEN");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT, "EMAIL_TAKEN");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole() != null ? request.getRole() : User.Role.AGENT);
        user.setEnabled(true);

        String accessToken = jwtProvider.generateToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("New user registered: {}", user.getUsername());
        return new AuthDTO.TokenResponse(accessToken, refreshToken, jwtProvider.getExpiration(), toUserInfo(user));
    }

    @Transactional
    public AuthDTO.TokenResponse refreshToken(AuthDTO.RefreshTokenRequest request) {
        if (!jwtProvider.validateToken(request.getRefreshToken())) {
            throw new ApiException("Invalid refresh token", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
        }

        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException("Refresh token not found", HttpStatus.UNAUTHORIZED, "TOKEN_NOT_FOUND"));

        String accessToken = jwtProvider.generateToken(user);
        String newRefreshToken = jwtProvider.generateRefreshToken(user);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return new AuthDTO.TokenResponse(accessToken, newRefreshToken, jwtProvider.getExpiration(), toUserInfo(user));
    }

    @Transactional
    public void logout(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
            log.info("User {} logged out", username);
        });
    }

    @Transactional
    public void changePassword(String username, AuthDTO.ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException("Current password is incorrect", HttpStatus.BAD_REQUEST, "WRONG_PASSWORD");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user {}", username);
    }

    private AuthDTO.UserInfo toUserInfo(User user) {
        AuthDTO.UserInfo info = new AuthDTO.UserInfo();
        info.setId(user.getId());
        info.setUsername(user.getUsername());
        info.setEmail(user.getEmail());
        info.setFirstName(user.getFirstName());
        info.setLastName(user.getLastName());
        info.setRole(user.getRole());
        return info;
    }
}
