import json
import re
from datetime import datetime, timedelta

# JSON 파일 읽기
with open('/Users/user/bank-teller-workspace/data_crawling/formjson/hana_crawled_rates.json', 'r', encoding='utf-8') as f:
    rates_data = json.load(f)

# 상품 분류 함수
def classify_product(product_name):
    if any(keyword in product_name for keyword in ['예금', '통장', '입출금']):
        return '예금'
    elif any(keyword in product_name for keyword in ['적금', '저축']):
        return '적금'
    elif any(keyword in product_name for keyword in ['대출', '론', '신용']):
        return '대출'
    elif any(keyword in product_name for keyword in ['펀드', '투자']):
        return '펀드'
    else:
        return '기타'

# 금리 추출 함수
def extract_rate(rate_str):
    if not rate_str:
        return 0.0
    # 숫자와 소수점만 추출
    rate_match = re.search(r'(\d+\.?\d*)', rate_str)
    if rate_match:
        return float(rate_match.group(1))
    return 0.0

# 기간을 개월 수로 변환
def period_to_months(period_str):
    if not period_str:
        return 12
    
    # 숫자 추출
    number_match = re.search(r'(\d+)', period_str)
    if not number_match:
        return 12
    
    number = int(number_match.group(1))
    
    if '개월' in period_str:
        return number
    elif '년' in period_str:
        return number * 12
    elif '일' in period_str:
        return max(1, number // 30)
    else:
        return 12

# ProductRate SQL 생성
product_rate_sql = []
product_rate_id = 1

# LoanRate SQL 생성
loan_rate_sql = []
loan_rate_id = 1

# 상품 ID 매핑 (실제 DB의 상품 ID와 매칭)
product_id_mapping = {}

# 모든 상품에 대해 rate 데이터 생성
for product_name, rate_info in rates_data.items():
    product_type = classify_product(product_name)
    
    # 상품 ID 생성 (실제로는 DB에서 가져와야 함)
    product_id = f"P{product_rate_id:03d}"
    product_id_mapping[product_name] = product_id
    
    if product_type in ['예금', '적금']:
        # ProductRate 테이블용 데이터
        if '데이터' in rate_info and rate_info['데이터']:
            for rate_data in rate_info['데이터']:
                period = rate_data.get('기간', '12개월')
                rate = rate_data.get('금리(연율,세전)', '0%')
                
                months = period_to_months(period)
                rate_value = extract_rate(rate)
                
                sql = f"""INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR{product_rate_id:03d}', '{product_id}', {months}, {rate_value}, 1000000, 100000000, '2024-01-01', '2025-12-31');"""
                product_rate_sql.append(sql)
                product_rate_id += 1
        else:
            # 기본 데이터가 없는 경우 기본값 생성
            sql = f"""INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR{product_rate_id:03d}', '{product_id}', 12, 2.5, 1000000, 100000000, '2024-01-01', '2025-12-31');"""
            product_rate_sql.append(sql)
            product_rate_id += 1
    
    elif product_type == '대출':
        # LoanRate 테이블용 데이터
        base_rate = 3.5  # 기본 금리
        additional_rate = 1.0  # 가산 금리
        preferential_rate = 0.5  # 우대 금리
        
        # 기존 데이터에서 금리 정보 추출
        if '데이터' in rate_info and rate_info['데이터']:
            for rate_data in rate_info['데이터']:
                rate = rate_data.get('금리(연율,세전)', '0%')
                rate_value = extract_rate(rate)
                if rate_value > 0:
                    base_rate = rate_value
                    break
        
        sql = f"""INSERT INTO LoanRate (RateID, ProductID, BaseRate, AdditionalRate, PreferentialRate, MinRate, MaxRate, RateChangeCycle, EffectiveDate, EndDate) VALUES 
('LR{loan_rate_id:03d}', '{product_id}', {base_rate}, {additional_rate}, {preferential_rate}, {base_rate - 1}, {base_rate + 2}, '월', '2024-01-01', '2025-12-31');"""
        loan_rate_sql.append(sql)
        loan_rate_id += 1

# SQL 파일로 저장
with open('/Users/user/bank-teller-workspace/insert_all_rates.sql', 'w', encoding='utf-8') as f:
    f.write("-- ProductRate 데이터 삽입\n")
    f.write("\n".join(product_rate_sql))
    f.write("\n\n-- LoanRate 데이터 삽입\n")
    f.write("\n".join(loan_rate_sql))

print(f"ProductRate SQL 생성 완료: {len(product_rate_sql)}개")
print(f"LoanRate SQL 생성 완료: {len(loan_rate_sql)}개")

# 상품 ID 매핑 저장
with open('/Users/user/bank-teller-workspace/product_id_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(product_id_mapping, f, ensure_ascii=False, indent=2)

print("상품 ID 매핑 파일 저장 완료")
