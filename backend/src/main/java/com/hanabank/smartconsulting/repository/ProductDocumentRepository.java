package com.hanabank.smartconsulting.repository;

import com.hanabank.smartconsulting.entity.ProductDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDocumentRepository extends JpaRepository<ProductDocument, Long> {
    
    List<ProductDocument> findByStatus(ProductDocument.DocumentStatus status);
    
    ProductDocument findByDocumentName(String documentName);
    
    ProductDocument findByStoragePath(String storagePath);
}
