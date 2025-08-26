package com.hanabank.smartconsulting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {
    
    private final WebClient webClient;
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;
    
    @Value("${supabase.storage.bucket}")
    private String storageBucket;
    
    /**
     * Supabase Storage에서 파일 목록 조회
     */
    public List<Map<String, Object>> listFiles(String folderPath) {
        try {
            log.info("Supabase Storage에서 파일 목록 조회: {}", folderPath);
            
            String url = supabaseUrl + "/storage/v1/object/list/" + storageBucket;
            
            Map<String, Object> requestBody = Map.of(
                "prefix", folderPath,
                "limit", 100,
                "offset", 0
            );
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = (List<Map<String, Object>>) webClient.post()
                    .uri(url)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .header("apikey", supabaseAnonKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();
            
            log.info("조회된 파일 개수: {}", response != null ? response.size() : 0);
            return response;
            
        } catch (Exception e) {
            log.error("Supabase Storage 파일 목록 조회 실패", e);
            return List.of();
        }
    }
    
    /**
     * Supabase Storage에서 PDF 파일 다운로드
     */
    public byte[] downloadFile(String filePath) {
        try {
            log.info("Supabase Storage에서 파일 다운로드: {}", filePath);
            
            String url = supabaseUrl + "/storage/v1/object/" + storageBucket + "/" + filePath;
            
            byte[] fileContent = webClient.get()
                    .uri(url)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .header("apikey", supabaseAnonKey)
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();
            
            log.info("파일 다운로드 완료: {} bytes", fileContent != null ? fileContent.length : 0);
            return fileContent;
            
        } catch (Exception e) {
            log.error("Supabase Storage 파일 다운로드 실패: {}", filePath, e);
            return null;
        }
    }
    
    /**
     * 모든 PDF 파일 목록 조회 (상품별 폴더)
     */
    public List<String> getAllPdfFiles() {
        try {
            // 상품 유형별 폴더에서 PDF 파일 검색
            String[] productFolders = {"savings", "deposits", "loans", "funds", "insurance"};
            
            return java.util.Arrays.stream(productFolders)
                    .flatMap(folder -> {
                        List<Map<String, Object>> files = listFiles(folder + "/");
                        return files.stream()
                                .filter(file -> {
                                    String name = (String) file.get("name");
                                    return name != null && name.toLowerCase().endsWith(".pdf");
                                })
                                .map(file -> folder + "/" + file.get("name"));
                    })
                    .toList();
                    
        } catch (Exception e) {
            log.error("PDF 파일 목록 조회 실패", e);
            return List.of();
        }
    }
}

