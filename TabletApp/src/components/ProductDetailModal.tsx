import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { ProductDetail } from '../types';

const { width, height } = Dimensions.get('window');

interface ProductDetailModalProps {
  productDetail: ProductDetail | null;
  visible: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productDetail,
  visible,
  onClose,
}) => {
  if (!productDetail) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{productDetail.product_name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상품 타입</Text>
              <Text style={styles.sectionContent}>
                {productDetail.productType ||
                  productDetail.product_type ||
                  '일반 상품'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상품 특징</Text>
              <Text style={styles.sectionContent}>
                {productDetail.productFeatures ||
                  productDetail.product_features ||
                  '정보 없음'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가입 대상</Text>
              <Text style={styles.sectionContent}>
                {productDetail.targetCustomers ||
                  productDetail.target_customers ||
                  '정보 없음'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가입 금액</Text>
              <Text style={styles.sectionContent}>
                {productDetail.depositAmount ||
                  productDetail.deposit_amount ||
                  '정보 없음'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가입 기간</Text>
              <Text style={styles.sectionContent}>
                {productDetail.depositPeriod ||
                  productDetail.deposit_period ||
                  '정보 없음'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>기본 금리</Text>
              <Text style={[styles.sectionContent, styles.interestRate]}>
                {productDetail.interestRate ||
                  productDetail.interest_rate ||
                  '정보 없음'}
              </Text>
            </View>

            {(productDetail.preferentialRate ||
              productDetail.preferential_rate) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>우대 금리</Text>
                <Text style={[styles.sectionContent, styles.preferentialRate]}>
                  {productDetail.preferentialRate ||
                    productDetail.preferential_rate}
                </Text>
              </View>
            )}

            {(productDetail.taxBenefits || productDetail.tax_benefits) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>세제 혜택</Text>
                <Text style={styles.sectionContent}>
                  {productDetail.taxBenefits || productDetail.tax_benefits}
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💡 직원과 함께 상품에 대해 상담받아보세요!
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: width * 0.9,
    maxWidth: 600,
    maxHeight: height * 0.8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f3f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b894',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  interestRate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  preferentialRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e65100',
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#00b894',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductDetailModal;
