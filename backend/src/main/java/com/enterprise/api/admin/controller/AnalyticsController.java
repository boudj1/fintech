package com.enterprise.api.admin.controller;

import com.enterprise.api.admin.model.dto.AuditLogDTO;
import com.enterprise.api.admin.service.AnalyticsService;
import com.enterprise.core.constants.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPERVISOR', 'ANALYST')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLogDTO.AuditLogResponse>> findAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(analyticsService.findAllLogs(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<Page<AuditLogDTO.AuditLogResponse>> findLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(analyticsService.findLogsByUser(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/logs/stats")
    public ResponseEntity<AuditLogDTO.AuditStats> getAuditStats() {
        return ResponseEntity.ok(analyticsService.getAuditStats());
    }
}
