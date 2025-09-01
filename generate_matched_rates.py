import json
import re
from datetime import datetime, timedelta

# JSON 파일 읽기
with open('/Users/user/bank-teller-workspace/data_crawling/formjson/hana_crawled_rates.json', 'r', encoding='utf-8') as f:
    rates_data = json.load(f)

# 금리 추출 함수
def extract_rate(rate_str):
    if not rate_str:
        return 0.0
    rate_match = re.search(r'(\d+\.?\d*)', rate_str)
    if rate_match:
        return float(rate_match.group(1))
    return 0.0

# 기간을 개월 수로 변환
def period_to_months(period_str):
    if not period_str:
        return 12
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

# 실제 DB 상품 데이터 (간단한 매핑)
db_products = {
    "급여하나 월복리 적금": "P001_급여하나월복리적금",
    "연금하나 월복리 적금": "P002_연금하나월복리적금", 
    "주거래하나 월복리 적금": "P003_주거래하나월복리적금",
    "아이 꿈하나 적금": "P004_아이꿈하나적금",
    "하나 장병내일준비적금": "P005_하나장병내일준비적금",
    "정기예금": "P021_정기예금",
    "3·6·9 정기예금": "P022_3·6·9정기예금",
    "주택담보대출": "P017_주택담보대출",
    "신용대출": "P018_신용대출",
    "사업자대출": "P019_사업자대출",
    "개인사업자대출": "P020_개인사업자대출",
    "BEST 신용대출": "P015_BEST신용대출",
    "공무원가계자금대출": "P016_공무원가계자금대출",
    "주택신보 전세자금대출(M_P)": "P011_주택신보전세자금대출",
    "신혼부부전세론": "P012_신혼부부전세론",
    "다둥이전세론": "P013_다둥이전세론",
    "우량주택전세론": "P014_우량주택전세론"
}

# ProductRate SQL 생성
product_rate_sql = []
product_rate_id = 1

# LoanRate SQL 생성  
loan_rate_sql = []
loan_rate_id = 1

# 모든 상품에 대해 rate 데이터 생성
for product_name, rate_info in rates_data.items():
    # DB에서 매칭되는 상품 ID 찾기
    db_product_id = None
    for db_name, db_id in db_products.items():
        if product_name == db_name:
            db_product_id = db_id
            break
    
    if not db_product_id:
        continue  # 매칭되지 않는 상품은 건너뛰기
    
    # 상품 타입 확인
    if any(keyword in product_name for keyword in ['예금', '적금', '통장', '저축']):
        # ProductRate 테이블용 데이터
        if '데이터' in rate_info and rate_info['데이터']:
            for rate_data in rate_info['데이터']:
                period = rate_data.get('기간', '12개월')
                rate = rate_data.get('금리(연율,세전)', '0%')
                
                months = period_to_months(period)
                rate_value = extract_rate(rate)
                
                sql = f"""INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR{product_rate_id:03d}', '{db_product_id}', {months}, {rate_value}, 1000000, 100000000, '2024-01-01', '2025-12-31');"""
                product_rate_sql.append(sql)
                product_rate_id += 1
        else:
            # 기본 데이터가 없는 경우 기본값 생성
            sql = f"""INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR{product_rate_id:03d}', '{db_product_id}', 12, 2.5, 1000000, 100000000, '2024-01-01', '2025-12-31');"""
            product_rate_sql.append(sql)
            product_rate_id += 1
    
    elif any(keyword in product_name for keyword in ['대출', '론']):
        # LoanRate 테이블용 데이터
        base_rate = 3.5
        additional_rate = 1.0
        preferential_rate = 0.5
        
        if '데이터' in rate_info and rate_info['데이터']:
            for rate_data in rate_info['데이터']:
                rate = rate_data.get('금리(연율,세전)', '0%')
                rate_value = extract_rate(rate)
                if rate_value > 0:
                    base_rate = rate_value
                    break
        
        sql = f"""INSERT INTO LoanRate (RateID, ProductID, BaseRate, AdditionalRate, PreferentialRate, MinRate, MaxRate, RateChangeCycle, EffectiveDate, EndDate) VALUES 
('LR{loan_rate_id:03d}', '{db_product_id}', {base_rate}, {additional_rate}, {preferential_rate}, {base_rate - 1}, {base_rate + 2}, '월', '2024-01-01', '2025-12-31');"""
        loan_rate_sql.append(sql)
        loan_rate_id += 1

# SQL 파일로 저장
with open('/Users/user/bank-teller-workspace/insert_matched_rates.sql', 'w', encoding='utf-8') as f:
    f.write("-- ProductRate 데이터 삽입\n")
    f.write("\n".join(product_rate_sql))
    f.write("\n\n-- LoanRate 데이터 삽입\n")
    f.write("\n".join(loan_rate_sql))

print(f"ProductRate SQL 생성 완료: {len(product_rate_sql)}개")
print(f"LoanRate SQL 생성 완료: {len(loan_rate_sql)}개")
