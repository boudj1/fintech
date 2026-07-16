package com.enterprise.api.admin.service;

import com.enterprise.api.admin.model.dto.AuditLogDTO;
import com.enterprise.api.admin.model.entity.AuditLog;
import com.enterprise.api.admin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLogDTO.AuditLogResponse> findAllLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<AuditLogDTO.AuditLogResponse> findLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Transactional
    public void recordAction(Long userId, String username, String action,
                              String entityType, Long entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setUsername(username);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }

    public AuditLogDTO.AuditStats getAuditStats() {
        AuditLogDTO.AuditStats stats = new AuditLogDTO.AuditStats();
        stats.setTotal(auditLogRepository.count());
        return stats;
    }

    private AuditLogDTO.AuditLogResponse toResponse(AuditLog a) {
        AuditLogDTO.AuditLogResponse r = new AuditLogDTO.AuditLogResponse();
        r.setId(a.getId());
        r.setUserId(a.getUserId());
        r.setUsername(a.getUsername());
        r.setAction(a.getAction());
        r.setEntityType(a.getEntityType());
        r.setEntityId(a.getEntityId());
        r.setDetails(a.getDetails());
        r.setIpAddress(a.getIpAddress());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
