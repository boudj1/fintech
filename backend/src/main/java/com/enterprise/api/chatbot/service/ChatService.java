package com.enterprise.api.chatbot.service;

import com.enterprise.api.admin.model.entity.Customer;
import com.enterprise.api.admin.repository.CustomerRepository;
import com.enterprise.api.chatbot.client.ChatbotServiceClient;
import com.enterprise.api.chatbot.model.dto.ChatbotContext;
import com.enterprise.api.chatbot.model.dto.MessageDTO;
import com.enterprise.api.chatbot.model.entity.Conversation;
import com.enterprise.api.chatbot.model.entity.Message;
import com.enterprise.api.chatbot.repository.ConversationRepository;
import com.enterprise.api.chatbot.repository.MessageRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final CustomerRepository customerRepository;
    private final ChatbotServiceClient chatbotServiceClient;
    private final ChatbotContextService chatbotContextService;

    @Transactional
    public MessageDTO.ChatSessionResponse createSession(MessageDTO.CreateChatSessionRequest request) {
        Conversation conversation = new Conversation();

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ApiException("Customer not found", HttpStatus.NOT_FOUND));
            conversation.setCustomer(customer);
        }

        conversation.setSubject(request.getSubject());
        conversation.setChannel(request.getChannel() != null ? request.getChannel() : Conversation.Channel.WEB);
        conversation.setLanguage(request.getLanguage() != null ? request.getLanguage() : "en");
        conversation = conversationRepository.save(conversation);

        if (request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            saveMessage(conversation, request.getInitialMessage(), Message.SenderType.CUSTOMER, null, null);
        }

        log.info("Chat session created: {}", conversation.getId());
        return toSessionResponse(conversation);
    }

    public Page<MessageDTO.ChatSessionResponse> findSessions(Conversation.Status status,
                                                              Long customerId, Pageable pageable) {
        return conversationRepository.findWithFilters(status, customerId, pageable)
                .map(this::toSessionResponse);
    }

    public MessageDTO.ChatSessionResponse findSessionById(Long id) {
        return toSessionResponse(getSessionOrThrow(id));
    }

    public List<MessageDTO.MessageResponse> getMessages(Long conversationId) {
        getSessionOrThrow(conversationId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream().map(this::toMessageResponse).toList();
    }

    @Transactional
    public MessageDTO.MessageResponse sendMessage(Long conversationId, MessageDTO.SendMessageRequest request) {
        Conversation conversation = getSessionOrThrow(conversationId);

        Message userMessage = saveMessage(conversation, request.getContent(),
                request.getSenderType(), request.getSenderId(), request.getSenderName());

        if (request.getSenderType() == Message.SenderType.CUSTOMER) {
            String sessionId = "conv-" + conversationId;
            // Load financial context so the AI can answer questions about the user's data
            ChatbotContext context = null;
            if (request.getSenderId() != null) {
                try {
                    context = chatbotContextService.buildContext(request.getSenderId());
                } catch (Exception e) {
                    log.warn("Could not load financial context for user {}: {}", request.getSenderId(), e.getMessage());
                }
            }
            ChatbotServiceClient.ChatbotResponse aiResponse = chatbotServiceClient.processMessage(
                    request.getContent(), sessionId, conversation.getLanguage(), context
            );

            Message aiMessage = saveMessage(conversation, aiResponse.response(),
                    Message.SenderType.AI_BOT, null, "AI Assistant");
            aiMessage.setAiGenerated(true);
            aiMessage.setConfidenceScore(aiResponse.confidence());
            messageRepository.save(aiMessage);

            if (aiResponse.shouldEscalate()) {
                conversation.setStatus(Conversation.Status.ESCALATED);
                conversationRepository.save(conversation);
            }
        }

        return toMessageResponse(userMessage);
    }

    @Transactional
    public MessageDTO.ChatSessionResponse updateSession(Long id, MessageDTO.UpdateChatSessionRequest request) {
        Conversation conversation = getSessionOrThrow(id);

        if (request.getStatus() != null) {
            conversation.setStatus(request.getStatus());
            if (request.getStatus() == Conversation.Status.RESOLVED) {
                conversation.setResolvedAt(LocalDateTime.now());
            }
        }
        if (request.getSatisfactionScore() != null) {
            conversation.setSatisfactionScore(request.getSatisfactionScore());
        }

        return toSessionResponse(conversationRepository.save(conversation));
    }

    public MessageDTO.ChatSessionStats getStats() {
        MessageDTO.ChatSessionStats stats = new MessageDTO.ChatSessionStats();
        stats.setTotal(conversationRepository.count());
        stats.setOpen(conversationRepository.countByStatus(Conversation.Status.OPEN));
        stats.setInProgress(conversationRepository.countByStatus(Conversation.Status.IN_PROGRESS));
        stats.setResolved(conversationRepository.countByStatus(Conversation.Status.RESOLVED));
        stats.setEscalated(conversationRepository.countByStatus(Conversation.Status.ESCALATED));
        stats.setAvgSatisfactionScore(conversationRepository.averageSatisfactionScore());
        return stats;
    }

    private Conversation getSessionOrThrow(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Conversation not found: " + id, HttpStatus.NOT_FOUND));
    }

    private Message saveMessage(Conversation conversation, String content,
                                Message.SenderType senderType, Long senderId, String senderName) {
        Message msg = new Message();
        msg.setConversation(conversation);
        msg.setContent(content);
        msg.setSenderType(senderType);
        msg.setSenderId(senderId);
        msg.setSenderName(senderName);
        return messageRepository.save(msg);
    }

    private MessageDTO.ChatSessionResponse toSessionResponse(Conversation c) {
        MessageDTO.ChatSessionResponse r = new MessageDTO.ChatSessionResponse();
        r.setId(c.getId());
        if (c.getCustomer() != null) {
            r.setCustomerId(c.getCustomer().getId());
            r.setCustomerName(c.getCustomer().getFirstName() + " " + c.getCustomer().getLastName());
        }
        if (c.getAssignedAgent() != null) {
            r.setAssignedAgentId(c.getAssignedAgent().getId());
            r.setAssignedAgentName(c.getAssignedAgent().getFirstName() + " " + c.getAssignedAgent().getLastName());
        }
        r.setSubject(c.getSubject());
        r.setStatus(c.getStatus());
        r.setChannel(c.getChannel());
        r.setLanguage(c.getLanguage());
        r.setSatisfactionScore(c.getSatisfactionScore());
        r.setResolvedAt(c.getResolvedAt());
        r.setMessageCount(c.getMessages().size());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    private MessageDTO.MessageResponse toMessageResponse(Message m) {
        MessageDTO.MessageResponse r = new MessageDTO.MessageResponse();
        r.setId(m.getId());
        r.setConversationId(m.getConversation().getId());
        r.setContent(m.getContent());
        r.setSenderType(m.getSenderType());
        r.setSenderId(m.getSenderId());
        r.setSenderName(m.getSenderName());
        r.setAiGenerated(m.isAiGenerated());
        r.setConfidenceScore(m.getConfidenceScore());
        r.setCreatedAt(m.getCreatedAt());
        return r;
    }
}
