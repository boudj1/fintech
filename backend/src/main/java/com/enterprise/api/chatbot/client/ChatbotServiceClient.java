package com.enterprise.api.chatbot.client;

import com.enterprise.api.chatbot.model.dto.ChatbotContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class ChatbotServiceClient {

    private final RestTemplate restTemplate;
    private final String chatbotServiceUrl;
    private final ObjectMapper objectMapper;

    public ChatbotServiceClient(
            @Value("${ai.chatbot.url:http://localhost:8001}") String chatbotServiceUrl,
            ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.chatbotServiceUrl = chatbotServiceUrl;
        this.objectMapper = objectMapper;
    }

    /**
     * Calls the Python chatbot service with the user's financial context.
     * The context is injected into the AI system prompt server-side so the
     * chatbot can answer questions about transactions, accounts and beneficiaries.
     */
    public ChatbotResponse processMessage(String message, String sessionId,
                                          String language, ChatbotContext context) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message);
            requestBody.put("session_id", sessionId);
            requestBody.put("language", language != null ? language : "fr");
            if (context != null) {
                // Serialize context to plain Map for JSON serialization
                requestBody.put("context", objectMapper.convertValue(context, Map.class));
            }
            return restTemplate.postForObject(
                    chatbotServiceUrl + "/api/chatbot/message",
                    requestBody,
                    ChatbotResponse.class
            );
        } catch (Exception e) {
            log.error("Chatbot service call failed: {}", e.getMessage());
            return ChatbotResponse.fallback();
        }
    }

    public record ChatbotResponse(
            String response,
            String sessionId,
            String intent,
            String language,
            double confidence,
            boolean shouldEscalate
    ) {
        static ChatbotResponse fallback() {
            return new ChatbotResponse(
                    "Je suis temporairement indisponible. Veuillez réessayer dans quelques instants.",
                    null, "OTHER", "fr", 0.0, false
            );
        }
    }
}
