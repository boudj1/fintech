package com.enterprise.api.chatbot.repository;

import com.enterprise.api.chatbot.model.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Page<Conversation> findByStatus(Conversation.Status status, Pageable pageable);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:customerId IS NULL OR c.customer.id = :customerId)")
    Page<Conversation> findWithFilters(@Param("status") Conversation.Status status,
                                       @Param("customerId") Long customerId,
                                       Pageable pageable);

    long countByStatus(Conversation.Status status);

    @Query("SELECT AVG(c.satisfactionScore) FROM Conversation c WHERE c.satisfactionScore IS NOT NULL")
    Double averageSatisfactionScore();
}
