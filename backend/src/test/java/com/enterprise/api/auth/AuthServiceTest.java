package com.enterprise.api.auth;

import com.enterprise.api.auth.model.dto.AuthDTO;
import com.enterprise.api.auth.model.entity.User;
import com.enterprise.api.auth.repository.UserRepository;
import com.enterprise.api.auth.security.JwtProvider;
import com.enterprise.api.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtProvider jwtProvider;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encoded_password");
        testUser.setRole(User.Role.AGENT);
        testUser.setEnabled(true);
    }

    @Test
    void login_validCredentials_returnsToken() {
        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken("testuser", "password"));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtProvider.generateToken(testUser)).thenReturn("access-token");
        when(jwtProvider.generateRefreshToken(testUser)).thenReturn("refresh-token");
        when(jwtProvider.getExpiration()).thenReturn(3600000L);
        when(userRepository.save(any())).thenReturn(testUser);

        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        AuthDTO.TokenResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
    }

    @Test
    void register_newUser_returnsToken() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any())).thenReturn(testUser);
        when(jwtProvider.generateToken(any())).thenReturn("access-token");
        when(jwtProvider.generateRefreshToken(any())).thenReturn("refresh-token");
        when(jwtProvider.getExpiration()).thenReturn(3600000L);

        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@example.com");
        request.setPassword("password123");

        AuthDTO.TokenResponse response = authService.register(request);
        assertNotNull(response);
    }

    @Test
    void register_duplicateUsername_throwsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("other@example.com");
        request.setPassword("password123");

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    void register_duplicateEmail_throwsException() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    void logout_clearsRefreshToken() {
        testUser.setRefreshToken("some-token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);

        authService.logout("testuser");

        assertNull(testUser.getRefreshToken());
        verify(userRepository).save(testUser);
    }

    @Test
    void changePassword_correctCurrentPassword_succeeds() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldpass", "encoded_password")).thenReturn(true);
        when(passwordEncoder.encode("newpass123")).thenReturn("new_encoded");
        when(userRepository.save(any())).thenReturn(testUser);

        AuthDTO.ChangePasswordRequest request = new AuthDTO.ChangePasswordRequest();
        request.setCurrentPassword("oldpass");
        request.setNewPassword("newpass123");

        assertDoesNotThrow(() -> authService.changePassword("testuser", request));
    }
}
