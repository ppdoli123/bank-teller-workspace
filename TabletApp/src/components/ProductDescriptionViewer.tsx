import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  WebView,
  Alert,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ProductDescriptionViewerProps {
  product: any;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  onNext?: () => void;
}

const ProductDescriptionViewer: React.FC<ProductDescriptionViewerProps> = ({
  product,
  currentPage,
  totalPages,
  onPageChange,
  onClose,
  onNext,
}) => {
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(true);

  // PDF URL 생성 (1부터 80까지) - 백엔드 프록시 사용
  const getPdfUrl = (pageNumber: number) => {
    return `http://localhost:8080/api/documents/product-pdf/${pageNumber}`;
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handlePageInput = (inputPage: number) => {
    if (inputPage >= 1 && inputPage <= totalPages) {
      setPage(inputPage);
      onPageChange?.(inputPage);
    }
  };

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            📋 {product?.productName || product?.product_name || '상품'}{' '}
            상품설명서
          </Text>
          <Text style={styles.subtitle}>
            고객과 함께 상품 내용을 확인하세요
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PDF 뷰어 */}
      <View style={styles.pdfContainer}>
        <WebView
          source={{ uri: getPdfUrl(page) }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            Alert.alert('오류', 'PDF를 불러올 수 없습니다.');
          }}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>
              📄 상품설명서를 불러오는 중...
            </Text>
          </View>
        )}
      </View>

      {/* 페이지 네비게이션 */}
      <View style={styles.navigation}>
        <View style={styles.pageControls}>
          <TouchableOpacity
            style={[styles.navButton, page === 1 && styles.disabledButton]}
            onPress={handlePrevPage}
            disabled={page === 1}
          >
            <Text style={styles.navButtonText}>◀ 이전</Text>
          </TouchableOpacity>

          <View style={styles.pageInfo}>
            <Text style={styles.pageText}>
              페이지: {page} / {totalPages}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              page === totalPages && styles.disabledButton,
            ]}
            onPress={handleNextPage}
            disabled={page === totalPages}
          >
            <Text style={styles.navButtonText}>다음 ▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          {onClose && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>닫기</Text>
            </TouchableOpacity>
          )}
          {onNext && (
            <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
              <Text style={styles.primaryButtonText}>📊 시뮬레이션 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 1000,
  },
  header: {
    backgroundColor: '#00857A',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pdfContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  navigation: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#00857A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  pageInfo: {
    marginHorizontal: 16,
  },
  pageText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00857A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default ProductDescriptionViewer;
