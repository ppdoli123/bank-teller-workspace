import json
import re

# JSON 파일 읽기
with open('data_crawling/formjson/hana_crawled_rates.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 상품 분류를 위한 키워드
deposit_keywords = ['예금', '통장', '입출금', '자유입출금', '정기예금', '양도성예금증서', 'CD']
loan_keywords = ['대출', '론', '신용', '담보', '전세', '주택', '사업자', '개인사업자']
savings_keywords = ['적금', '저축', '키움', '희망', '꿈', '미래', '행복', '연금', '급여', '주거래', '장병', '아동수당', '제휴', '원큐', '마이트립', '간편', '더']

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

def classify_status(product_name):
    if '판매중단' in product_name:
        return '판매중단'
    elif '한시판매' in product_name:
        return '한시판매'
    else:
        return '판매중'

def extract_rate(rate_str):
    if not rate_str:
        return 0.0
    rate_match = re.search(r'(\d+\.?\d*)', rate_str)
    if rate_match:
        return float(rate_match.group(1))
    return 0.0

# 기존 상품 목록 (이미 삽입된 상품들)
existing_products = [
    '급여하나 월복리 적금', '연금하나 월복리 적금', '주거래하나 월복리 적금', '아이 꿈하나 적금',
    '하나 장병내일준비적금', '하나 아동수당 적금(판매중단)', '하나 더 적금(한시판매)', '제휴 적금(판매중단)',
    '하나 원큐 적금(판매중단)', '마이트립(My Trip)적금-(일반형)(판매중단)', '주택신보 전세자금대출(M_P)',
    '신혼부부전세론(M_P)', '다둥이전세론(M_P)', '우량주택전세론(M_P)', 'BEST 신용대출',
    '공무원가계자금대출', '주택담보대출', '신용대출', '사업자대출', '개인사업자대출',
    '정기예금', '3·6·9 정기예금', '고단위 플러스(금리연동형)', '고단위 플러스(금리확정형)',
    '양도성예금증서(CD)', '하나 생명보험', '하나 건강보험', '하나 주식형펀드', '하나 채권형펀드',
    '하나 ISA', '하나 퇴직연금', '청년희망키움통장(손님)(판매중단)', '대전시청년희망통장(고객)(판매중단)',
    '간편 적금(판매중단)', '미래 행복 통장(기관)', '마이트립(My Trip)적금-(마일리지l형)(판매중단)',
    '마이트립(My Trip)적금-(마일리지ll형)(판매중단)', '평생 군인 적금', '금연성공 적금(판매중단)',
    '청년저축계좌(개인)(판매중단)', '청년저축계좌(기관)(판매중단)', '손님케어적금'
]

# SQL 생성
product_inserts = []
product_rate_inserts = []
loan_rate_inserts = []
deposit_inserts = []
loan_inserts = []

product_id_counter = 42  # 기존 41개 이후부터 시작

for product_name, product_data in data.items():
    # 이미 존재하는 상품인지 확인
    if product_name in existing_products:
        continue
    
    product_id = f"P{product_id_counter:03d}_{product_name.replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_')[:20]}"
    product_type = classify_product(product_name)
    status = classify_status(product_name)
    
    # 기본 금리 계산
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
with open('insert_remaining_products.sql', 'w', encoding='utf-8') as f:
    f.write("-- 나머지 상품 데이터 삽입\n\n")
    
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

print(f"추가할 상품 수: {len(product_inserts)}")
print(f"ProductRate 수: {len(product_rate_inserts)}")
print(f"LoanRate 수: {len(loan_rate_inserts)}")
print(f"Deposit 수: {len(deposit_inserts)}")
print(f"Loan 수: {len(loan_inserts)}")
print("insert_remaining_products.sql 파일이 생성되었습니다.")
