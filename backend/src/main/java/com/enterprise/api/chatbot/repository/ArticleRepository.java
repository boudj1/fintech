package com.enterprise.api.chatbot.repository;

import com.enterprise.api.chatbot.model.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    Page<Article> findByStatus(Article.Status status, Pageable pageable);

    List<Article> findByFeaturedTrueAndStatus(Article.Status status);

    @Query("SELECT a FROM Article a WHERE " +
           "a.status = :status AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Article> search(@Param("query") String query, @Param("status") Article.Status status, Pageable pageable);

    List<Article> findByCategory(String category);
}
