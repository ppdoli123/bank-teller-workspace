import requests
from bs4 import BeautifulSoup
import json

# 하나은행 금리 페이지에서 상품 목록과 금리 정보 가져오기
def get_hana_rates():
    url = "https://www.kebhana.com/app/portal/mkt/contents/rate_p02_01_pop.do?subMenu=02&actionCode=02"
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.kebhana.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    })
    
    # 메인 페이지 로드
    res = session.get(url)
    res.encoding = "utf-8"
    soup = BeautifulSoup(res.text, "html.parser")
    
    # 선택 박스에서 모든 상품 옵션 가져오기
    select = soup.find("select", {"name": "sel1"})
    if not select:
        print("선택박스를 찾을 수 없습니다.")
        return {}
    
    options = select.find_all("option")
    rate_data = {}
    
    print(f"총 {len(options)}개 상품 발견")
    
    for i, option in enumerate(options):
        if i == 0:  # "전체보기" 옵션 건너뛰기
            continue
            
        value = option.get('value', '')
        product_name = option.get_text(strip=True)
        
        if not value or value == '0':
            continue
            
        print(f"처리중: {product_name} (값: {value})")
        
        try:
            # 각 상품에 대해 금리 정보 요청
            # 실제 AJAX 요청이나 POST 요청일 수 있으므로 여러 방법 시도
            
            # 방법 1: GET 요청으로 파라미터 전달
            rate_url = f"{url}&sel1={value}"
            rate_res = session.get(rate_url)
            rate_res.encoding = "utf-8"
            rate_soup = BeautifulSoup(rate_res.text, "html.parser")
            
            # 금리 정보가 있는 div 찾기
            rate_div = rate_soup.find("div", id="hanaContentDiv_rate")
            if rate_div:
                # 테이블에서 금리 정보 추출
                tables = rate_div.find_all("table")
                for table in tables:
                    rows = table.find_all("tr")
                    for row in rows:
                        cols = row.find_all(["td", "th"])
                        if len(cols) >= 2:
                            col_texts = [col.get_text(strip=True) for col in cols]
                            # 금리가 포함된 행 찾기
                            for text in col_texts:
                                if '%' in text and any(c.isdigit() for c in text):
                                    rate_data[product_name] = text
                                    print(f"  -> 금리: {text}")
                                    break
                            if product_name in rate_data:
                                break
                    if product_name in rate_data:
                        break
            
            # 금리를 찾지 못한 경우
            if product_name not in rate_data:
                print(f"  -> 금리 정보 없음")
                
        except Exception as e:
            print(f"  -> 오류: {e}")
            
        # 너무 많은 요청을 방지하기 위해 처음 5개만 테스트
        if i >= 5:
            break
    
    return rate_data

# 테스트 실행
print("=== 하나은행 금리 정보 수집 ===")
rates = get_hana_rates()
print(f"\n=== 수집된 금리 정보 ({len(rates)}개) ===")
for product, rate in rates.items():
    print(f"{product}: {rate}")
