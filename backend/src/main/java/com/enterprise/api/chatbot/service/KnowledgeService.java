package com.enterprise.api.chatbot.service;

import com.enterprise.api.chatbot.model.dto.MessageDTO;
import com.enterprise.api.chatbot.model.entity.Article;
import com.enterprise.api.chatbot.repository.ArticleRepository;
import com.enterprise.core.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeService {

    private final ArticleRepository articleRepository;

    public Page<MessageDTO.ArticleResponse> findAll(String query, Article.Status status, Pageable pageable) {
        Page<Article> articles;
        if (query != null && !query.isBlank()) {
            articles = articleRepository.search(query,
                    status != null ? status : Article.Status.PUBLISHED, pageable);
        } else if (status != null) {
            articles = articleRepository.findByStatus(status, pageable);
        } else {
            articles = articleRepository.findAll(pageable);
        }
        return articles.map(this::toResponse);
    }

    @Transactional
    public MessageDTO.ArticleResponse findById(Long id) {
        Article article = getOrThrow(id);
        article.setViewCount(article.getViewCount() + 1);
        return toResponse(articleRepository.save(article));
    }

    @Transactional
    public MessageDTO.ArticleResponse create(MessageDTO.ArticleRequest request) {
        Article article = new Article();
        mapRequest(request, article);
        log.info("Article created: {}", article.getTitle());
        return toResponse(articleRepository.save(article));
    }

    @Transactional
    public MessageDTO.ArticleResponse update(Long id, MessageDTO.ArticleRequest request) {
        Article article = getOrThrow(id);
        mapRequest(request, article);
        return toResponse(articleRepository.save(article));
    }

    @Transactional
    public void delete(Long id) {
        getOrThrow(id);
        articleRepository.deleteById(id);
        log.info("Article deleted: {}", id);
    }

    private Article getOrThrow(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Article not found: " + id, HttpStatus.NOT_FOUND));
    }

    private void mapRequest(MessageDTO.ArticleRequest request, Article article) {
        if (request.getTitle() != null) article.setTitle(request.getTitle());
        if (request.getContent() != null) article.setContent(request.getContent());
        if (request.getCategory() != null) article.setCategory(request.getCategory());
        if (request.getTags() != null) article.setTags(request.getTags());
        if (request.getLanguage() != null) article.setLanguage(request.getLanguage());
        if (request.getStatus() != null) article.setStatus(request.getStatus());
    }

    private MessageDTO.ArticleResponse toResponse(Article a) {
        MessageDTO.ArticleResponse r = new MessageDTO.ArticleResponse();
        r.setId(a.getId());
        r.setTitle(a.getTitle());
        r.setContent(a.getContent());
        r.setCategory(a.getCategory());
        r.setTags(a.getTags());
        r.setStatus(a.getStatus());
        r.setViewCount(a.getViewCount());
        r.setFeatured(a.isFeatured());
        r.setLanguage(a.getLanguage());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
