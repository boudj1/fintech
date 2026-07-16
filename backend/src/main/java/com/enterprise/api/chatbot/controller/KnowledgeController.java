package com.enterprise.api.chatbot.controller;

import com.enterprise.api.chatbot.model.dto.MessageDTO;
import com.enterprise.api.chatbot.model.entity.Article;
import com.enterprise.api.chatbot.service.KnowledgeService;
import com.enterprise.core.constants.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Constants.API_V1 + "/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    @GetMapping
    public ResponseEntity<Page<MessageDTO.ArticleResponse>> findAll(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Article.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(knowledgeService.findAll(query, status,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDTO.ArticleResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPERVISOR')")
    public ResponseEntity<MessageDTO.ArticleResponse> create(@RequestBody MessageDTO.ArticleRequest request) {
        return ResponseEntity.ok(knowledgeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPERVISOR')")
    public ResponseEntity<MessageDTO.ArticleResponse> update(
            @PathVariable Long id,
            @RequestBody MessageDTO.ArticleRequest request) {
        return ResponseEntity.ok(knowledgeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        knowledgeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
