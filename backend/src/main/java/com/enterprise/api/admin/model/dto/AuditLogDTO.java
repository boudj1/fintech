package com.enterprise.api.admin.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

public class AuditLogDTO {

    @Data
    public static class AuditLogResponse {
        private Long id;
        private Long userId;
        private String username;
        private String action;
        private String entityType;
        private Long entityId;
        private String details;
        private String ipAddress;
        private LocalDateTime createdAt;
    }

    @Data
    public static class AuditStats {
        private long total;
        private long todayCount;
    }
}
