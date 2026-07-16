package com.enterprise.api.admin.controller;

import com.enterprise.api.auth.model.dto.AuthDTO;
import com.enterprise.api.auth.model.entity.User;
import com.enterprise.api.auth.repository.UserRepository;
import com.enterprise.core.constants.Constants;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class UserManagementController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<AuthDTO.UserInfo>> findAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuthDTO.UserInfo> users = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toUserInfo);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthDTO.UserInfo> findUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found: " + id, HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(toUserInfo(user));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AuthDTO.UserInfo> updateUserRole(
            @PathVariable Long id,
            @RequestParam User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found: " + id, HttpStatus.NOT_FOUND));
        user.setRole(role);
        return ResponseEntity.ok(toUserInfo(userRepository.save(user)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AuthDTO.UserInfo> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found: " + id, HttpStatus.NOT_FOUND));
        user.setEnabled(enabled);
        return ResponseEntity.ok(toUserInfo(userRepository.save(user)));
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
