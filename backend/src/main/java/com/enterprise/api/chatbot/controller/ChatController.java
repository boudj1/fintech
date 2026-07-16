package com.enterprise.api.chatbot.controller;

import com.enterprise.api.chatbot.model.dto.MessageDTO;
import com.enterprise.api.chatbot.model.entity.Conversation;
import com.enterprise.api.chatbot.service.ChatService;
import com.enterprise.core.constants.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(Constants.API_V1 + "/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<MessageDTO.ChatSessionResponse> createSession(
            @RequestBody MessageDTO.CreateChatSessionRequest request) {
        return ResponseEntity.ok(chatService.createSession(request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<Page<MessageDTO.ChatSessionResponse>> findSessions(
            @RequestParam(required = false) Conversation.Status status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(chatService.findSessions(status, customerId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<MessageDTO.ChatSessionResponse> findSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.findSessionById(id));
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<List<MessageDTO.MessageResponse>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getMessages(id));
    }

    @PostMapping("/send")
    public ResponseEntity<MessageDTO.MessageResponse> sendMessage(
            @RequestParam Long conversationId,
            @RequestBody MessageDTO.SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(conversationId, request));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<Page<MessageDTO.ChatSessionResponse>> getHistoryByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(chatService.findSessions(null, userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<MessageDTO.ChatSessionResponse> updateSession(
            @PathVariable Long id,
            @RequestBody MessageDTO.UpdateChatSessionRequest request) {
        return ResponseEntity.ok(chatService.updateSession(id, request));
    }

    @GetMapping("/stats")
    public ResponseEntity<MessageDTO.ChatSessionStats> getStats() {
        return ResponseEntity.ok(chatService.getStats());
    }
}
