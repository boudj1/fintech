package com.enterprise.api.chatbot.model.dto;

import com.enterprise.api.chatbot.model.entity.Conversation;
import com.enterprise.api.chatbot.model.entity.Message;
import lombok.Data;

import java.time.LocalDateTime;

public class MessageDTO {

    @Data
    public static class CreateChatSessionRequest {
        private Long customerId;
        private String subject;
        private Conversation.Channel channel;
        private String language;
        private String initialMessage;
    }

    @Data
    public static class SendMessageRequest {
        private String content;
        private Message.SenderType senderType = Message.SenderType.CUSTOMER;
        private Long senderId;
        private String senderName;
    }

    @Data
    public static class UpdateChatSessionRequest {
        private Conversation.Status status;
        private Long assignedAgentId;
        private Integer satisfactionScore;
    }

    @Data
    public static class ChatSessionResponse {
        private Long id;
        private Long customerId;
        private String customerName;
        private Long assignedAgentId;
        private String assignedAgentName;
        private String subject;
        private Conversation.Status status;
        private Conversation.Channel channel;
        private String language;
        private Integer satisfactionScore;
        private LocalDateTime resolvedAt;
        private int messageCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class MessageResponse {
        private Long id;
        private Long conversationId;
        private String content;
        private Message.SenderType senderType;
        private Long senderId;
        private String senderName;
        private boolean aiGenerated;
        private Double confidenceScore;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ChatSessionStats {
        private long total;
        private long open;
        private long inProgress;
        private long resolved;
        private long escalated;
        private Double avgSatisfactionScore;
    }

    @Data
    public static class ArticleRequest {
        private String title;
        private String content;
        private String category;
        private String tags;
        private String language;
        private Article.Status status;
    }

    @Data
    public static class ArticleResponse {
        private Long id;
        private String title;
        private String content;
        private String category;
        private String tags;
        private Article.Status status;
        private int viewCount;
        private boolean featured;
        private String language;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class Article {
        public enum Status {
            DRAFT, PUBLISHED, ARCHIVED
        }
    }
}
