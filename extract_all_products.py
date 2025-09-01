import json
import re

# JSON 파일 읽기
with open('data_crawling/formjson/hana_crawled_rates.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 상품 분류를 위한 키워드
deposit_keywords = ['예금', '통장', '입출금', '자유입출금', '정기예금', '양도성예금증서', 'CD']
loan_keywords = ['대출', '론', '신용', '담보', '전세', '주택', '사업자', '개인사업자']
savings_keywords = ['적금', '저축', '키움', '희망', '꿈', '미래', '행복', '연금', '급여', '주거래', '장병', '아동수당', '제휴', '원큐', '마이트립', '간편', '더']

# 상품 분류 함수
def classify_product(product_name):
    product_name_lower = product_name.lower()
    
    for keyword in loan_keywords:
        if keyword in product_name_lower:
            return '대출'
    
    for keyword in savings_keywords:
        if keyword in product_name_lower:
            return '적금'
    
    for keyword in deposit_keywords:
        if keyword in product_name_lower:
            return '예금'
    
    return '기타'

# 상품 상태 분류 함수
def classify_status(product_name):
    if '판매중단' in product_name:
        return '판매중단'
    elif '한시판매' in product_name:
        return '한시판매'
    else:
        return '판매중'

# 금리 추출 함수
def extract_rate(rate_str):
    if not rate_str:
        return 0.0
    # "2.0%" -> 2.0
    rate_match = re.search(r'(\d+\.?\d*)', rate_str)
    if rate_match:
        return float(rate_match.group(1))
    return 0.0

# SQL 생성
product_inserts = []
product_rate_inserts = []
loan_rate_inserts = []
deposit_inserts = []
loan_inserts = []

product_id_counter = 32  # 기존 31개 이후부터 시작

for product_name, product_data in data.items():
    product_id = f"P{product_id_counter:03d}_{product_name.replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_')[:20]}"
    product_type = classify_product(product_name)
    status = classify_status(product_name)
    
    # 기본 금리 계산 (첫 번째 데이터의 금리 사용)
    base_rate = 0.0
    if product_data.get('데이터') and len(product_data['데이터']) > 0:
        first_data = product_data['데이터'][0]
        if '금리(연율,세전)' in first_data:
            base_rate = extract_rate(first_data['금리(연율,세전)'])
        elif '최저~최고금리' in first_data:
            rate_range = first_data['최저~최고금리']
            min_rate_match = re.search(r'(\d+\.?\d*)', rate_range)
            if min_rate_match:
                base_rate = float(min_rate_match.group(1))
    
    # Product 테이블 삽입
    product_inserts.append(f"('{product_id}', '{product_name}', '{product_type}', '하나은행 {product_name} 상품', '2022-01-01', '{status}', 100000.00, 100000000.00, {base_rate})")
    
    # 헤더 타입에 따른 처리
    headers = product_data.get('헤더', [])
    
    if '기간' in headers and '금리(연율,세전)' in headers:
        # 적금/예금 타입 (기간별 금리)
        for i, rate_data in enumerate(product_data.get('데이터', [])):
            period = rate_data.get('기간', '1년')
            rate_str = rate_data.get('금리(연율,세전)', '0%')
            rate = extract_rate(rate_str)
            
            rate_id = f"R{product_id_counter:03d}_{i+1:02d}"
            product_rate_inserts.append(f"('{rate_id}', '{product_id}', '{period}', {rate}, 0.000, {rate}, 100000.00, 100000000.00)")
    
    elif '금리구분' in headers and '기준금리' in headers:
        # 대출 타입 (기준금리+가산금리+우대금리)
        for i, rate_data in enumerate(product_data.get('데이터', [])):
            rate_type = rate_data.get('금리구분', '고정금리')
            base_rate = float(rate_data.get('기준금리', 0))
            spread_rate = float(rate_data.get('가산금리', 0))
            bonus_rate = float(rate_data.get('우대금리', 0))
            min_rate = float(rate_data.get('최저~최고금리', '0 ~ 0').split('~')[0].strip())
            max_rate = float(rate_data.get('최저~최고금리', '0 ~ 0').split('~')[1].strip())
            change_cycle = rate_data.get('금리변동주기', '만기일시')
            
            loan_rate_id = f"LR{product_id_counter:03d}_{i+1:02d}"
            loan_rate_inserts.append(f"('{loan_rate_id}', '{product_id}', '{rate_type}', {base_rate}, {spread_rate}, {bonus_rate}, {min_rate}, {max_rate}, '{change_cycle}')")
    
    # 하위 테이블 삽입
    if product_type == '적금':
        deposit_inserts.append(f"('{product_id}', '하나은행 {product_name} 혜택', '2025-12-31', 0.00)")
    elif product_type == '예금':
        deposit_inserts.append(f"('{product_id}', '하나은행 {product_name} 혜택', '2025-12-31', 0.00)")
    elif product_type == '대출':
        loan_inserts.append(f"('{product_id}', {base_rate}, 120, 100000000.00, false)")
    
    product_id_counter += 1

# SQL 파일 생성
with open('insert_all_products.sql', 'w', encoding='utf-8') as f:
    f.write("-- 모든 상품 데이터 삽입\n\n")
    
    f.write("-- Product 테이블 삽입\n")
    f.write("INSERT INTO Product (ProductID, ProductName, ProductType, Description, LaunchDate, SalesStatus, MinAmount, MaxAmount, BaseRate) VALUES\n")
    f.write(",\n".join(product_inserts) + ";\n\n")
    
    if product_rate_inserts:
        f.write("-- ProductRate 테이블 삽입\n")
        f.write("INSERT INTO ProductRate (RateID, ProductID, Period, BaseRate, BonusRate, TotalRate, MinAmount, MaxAmount) VALUES\n")
        f.write(",\n".join(product_rate_inserts) + ";\n\n")
    
    if loan_rate_inserts:
        f.write("-- LoanRate 테이블 삽입\n")
        f.write("INSERT INTO LoanRate (LoanRateID, ProductID, RateType, BaseRate, SpreadRate, BonusRate, MinRate, MaxRate, RateChangeCycle) VALUES\n")
        f.write(",\n".join(loan_rate_inserts) + ";\n\n")
    
    if deposit_inserts:
        f.write("-- Deposit 테이블 삽입\n")
        f.write("INSERT INTO Deposit (DepositProductID, Benefit, MaturityDate, Cost) VALUES\n")
        f.write(",\n".join(deposit_inserts) + ";\n\n")
    
    if loan_inserts:
        f.write("-- Loan 테이블 삽입\n")
        f.write("INSERT INTO Loan (LoanProductID, LoanInterestRate, RepaymentPeriod, MaxLoanAmount, CollateralRequired) VALUES\n")
        f.write(",\n".join(loan_inserts) + ";\n\n")

print(f"총 {len(data)}개 상품 처리 완료")
print(f"Product: {len(product_inserts)}개")
print(f"ProductRate: {len(product_rate_inserts)}개")
print(f"LoanRate: {len(loan_rate_inserts)}개")
print(f"Deposit: {len(deposit_inserts)}개")
print(f"Loan: {len(loan_inserts)}개")
print("insert_all_products.sql 파일이 생성되었습니다.")
