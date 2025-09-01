import json
import re
import requests
import time

# Supabase 설정
SUPABASE_URL = "https://jhfjigeuxrxxbbsoflcd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZmppZ2V1eHJ4eGJic29mbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzAsImV4cCI6MjA1MDU0Nzk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"

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

def execute_sql(sql):
    """Supabase에 SQL 실행"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    payload = {"query": sql}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            return True
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

# 기존 상품 수 확인
count_sql = "SELECT COUNT(*) as count FROM Product"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
payload = {"query": count_sql}

response = requests.post(url, headers=headers, json=payload)
if response.status_code == 200:
    current_count = response.json()[0]['count']
    print(f"현재 상품 수: {current_count}")
else:
    current_count = 31  # 기본값

product_id_counter = current_count + 1

# 상품 데이터 준비
products_to_insert = []
product_rates_to_insert = []
loan_rates_to_insert = []
deposits_to_insert = []
loans_to_insert = []

for product_name, product_data in data.items():
    # 이미 존재하는 상품인지 확인
    if any(product_name in existing for existing in products_to_insert):
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
    
    # Product 테이블 데이터
    products_to_insert.append({
        'ProductID': product_id,
        'ProductName': product_name,
        'ProductType': product_type,
        'Description': f'하나은행 {product_name} 상품',
        'LaunchDate': '2022-01-01',
        'SalesStatus': status,
        'MinAmount': 100000.00,
        'MaxAmount': 100000000.00,
        'BaseRate': base_rate
    })
    
    # 헤더 타입에 따른 처리
    headers = product_data.get('헤더', [])
    
    if '기간' in headers and '금리(연율,세전)' in headers:
        # 적금/예금 타입 (기간별 금리)
        for i, rate_data in enumerate(product_data.get('데이터', [])):
            period = rate_data.get('기간', '1년')
            rate_str = rate_data.get('금리(연율,세전)', '0%')
            rate = extract_rate(rate_str)
            
            rate_id = f"R{product_id_counter:03d}_{i+1:02d}"
            product_rates_to_insert.append({
                'RateID': rate_id,
                'ProductID': product_id,
                'Period': period,
                'BaseRate': rate,
                'BonusRate': 0.000,
                'TotalRate': rate,
                'MinAmount': 100000.00,
                'MaxAmount': 100000000.00
            })
    
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
            loan_rates_to_insert.append({
                'LoanRateID': loan_rate_id,
                'ProductID': product_id,
                'RateType': rate_type,
                'BaseRate': base_rate,
                'SpreadRate': spread_rate,
                'BonusRate': bonus_rate,
                'MinRate': min_rate,
                'MaxRate': max_rate,
                'RateChangeCycle': change_cycle
            })
    
    # 하위 테이블 데이터
    if product_type in ['적금', '예금']:
        deposits_to_insert.append({
            'DepositProductID': product_id,
            'Benefit': f'하나은행 {product_name} 혜택',
            'MaturityDate': '2025-12-31',
            'Cost': 0.00
        })
    elif product_type == '대출':
        loans_to_insert.append({
            'LoanProductID': product_id,
            'LoanInterestRate': base_rate,
            'RepaymentPeriod': 120,
            'MaxLoanAmount': 100000000.00,
            'CollateralRequired': False
        })
    
    product_id_counter += 1

print(f"처리할 상품 수: {len(products_to_insert)}")
print(f"ProductRate 수: {len(product_rates_to_insert)}")
print(f"LoanRate 수: {len(loan_rates_to_insert)}")
print(f"Deposit 수: {len(deposits_to_insert)}")
print(f"Loan 수: {len(loans_to_insert)}")

# 데이터 삽입 (배치 처리)
def insert_batch(table_name, data_list, batch_size=50):
    if not data_list:
        return
    
    for i in range(0, len(data_list), batch_size):
        batch = data_list[i:i+batch_size]
        
        # INSERT 문 생성
        columns = list(batch[0].keys())
        values_list = []
        
        for item in batch:
            values = []
            for col in columns:
                value = item[col]
                if isinstance(value, str):
                    values.append(f"'{value}'")
                else:
                    values.append(str(value))
            values_list.append(f"({', '.join(values)})")
        
        sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES {', '.join(values_list)};"
        
        print(f"Inserting {len(batch)} records into {table_name}...")
        if execute_sql(sql):
            print(f"Successfully inserted {len(batch)} records into {table_name}")
        else:
            print(f"Failed to insert batch into {table_name}")
        
        time.sleep(0.1)  # API 호출 제한 방지

# 순서대로 삽입
print("Starting data insertion...")

insert_batch('Product', products_to_insert)
insert_batch('ProductRate', product_rates_to_insert)
insert_batch('LoanRate', loan_rates_to_insert)
insert_batch('Deposit', deposits_to_insert)
insert_batch('Loan', loans_to_insert)

print("Data insertion completed!")
