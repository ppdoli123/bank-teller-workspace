package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.Embedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// @Repository
public interface EmbeddingRepository extends JpaRepository<Embedding, Long> {
    
    List<Embedding> findByDocumentId(String documentId);
    
    @Query(value = "SELECT * FROM embeddings WHERE document_id = :documentId ORDER BY chunk_id", nativeQuery = true)
    List<Embedding> findByDocumentIdOrdered(@Param("documentId") String documentId);
    
    // Note: Vector similarity search will be implemented with native SQL
    // as JPA doesn't directly support pgvector operations
}
