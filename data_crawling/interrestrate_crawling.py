import json
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from rapidfuzz import fuzz, process

# 파일 경로
JSON_FILE = "hana_products_with_pdf.json"  # 네 파일 경로
OUTPUT_FILE = "hana_products_with_rates.json"

# 1. 기존 JSON 로드
with open(JSON_FILE, "r", encoding="utf-8") as f:
    products = json.load(f)

# 2. Selenium을 사용하여 금리안내 페이지 크롤링
def get_hana_rates_selenium():
    # Chrome 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 브라우저 창을 띄우지 않음
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    
    # Chrome 드라이버 설정
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    rate_data = {}
    
    try:
        # 하나은행 금리 페이지 로드
        url = "https://www.kebhana.com/app/portal/mkt/contents/rate_p02_01_pop.do?subMenu=02&actionCode=02"
        driver.get(url)
        
        # 페이지 로드 대기
        wait = WebDriverWait(driver, 10)
        
        # 모든 카테고리 탭 처리
        categories = [
            {"name": "적립식예금", "subMenu": "02", "actionCode": "02", "base_url": "rate_p02_01_pop.do"},
            {"name": "정기예금", "subMenu": "03", "actionCode": "02", "base_url": "rate_p02_01_pop.do"},
            {"name": "입출금이 자유로운 예금", "subMenu": "01", "actionCode": "02", "base_url": "rate_p02_01_pop.do"},
            {"name": "담보대출", "subMenu": "21", "actionCode": "02", "base_url": "rate_p02_03.do"},
            {"name": "신용대출", "subMenu": "22", "actionCode": "02", "base_url": "rate_p02_03.do"},
            {"name": "전세대출", "subMenu": "24", "actionCode": "02", "base_url": "rate_p02_03.do"}
        ]
        
        for category in categories:
            print(f"\n=== {category['name']} 카테고리 처리 시작 ===")
            
            try:
                # 카테고리별 URL로 이동
                category_url = f"https://www.kebhana.com/app/portal/mkt/contents/{category['base_url']}?subMenu={category['subMenu']}&actionCode={category['actionCode']}"
                driver.get(category_url)
                time.sleep(3)
                
                # 선택 박스 찾기
                try:
                    select_element = wait.until(EC.presence_of_element_located((By.NAME, "sel1")))
                    select = Select(select_element)
                    
                    # 모든 옵션 가져오기 (한 번에 수집)
                    options_data = []
                    for option in select.options[1:]:  # 첫 번째는 "전체보기"이므로 제외
                        value = option.get_attribute("value")
                        product_name = option.text.strip()
                        if value and value != '0':
                            options_data.append({"value": value, "name": product_name})
                    
                    print(f"{category['name']} 카테고리에서 총 {len(options_data)}개 상품 발견")
                    
                    # 각 상품에 대해 개별 페이지 접근
                    for i, option_data in enumerate(options_data):
                        value = option_data["value"]
                        product_name = option_data["name"]
                        
                        print(f"  처리중 ({i+1}/{len(options_data)}): {product_name}")
                        
                        try:
                            # 각 상품마다 개별 페이지로 직접 접근
                            individual_url = f"{category_url}&sel1={value}"
                            print(f"    -> 개별 URL 접근")
                            
                            driver.get(individual_url)
                            time.sleep(3)  # 페이지 로드 대기
                            
                            # 금리 정보가 표시되는 영역 찾기
                            try:
                                rate_div = WebDriverWait(driver, 10).until(
                                    EC.presence_of_element_located((By.ID, "hanaContentDiv_rate"))
                                )
                                
                                # 추가 로드 대기
                                time.sleep(2)
                                
                                # 테이블 찾기
                                tables = rate_div.find_elements(By.TAG_NAME, "table")
                                print(f"    -> 테이블 수: {len(tables)}")
                                
                                rate_info_list = []
                                
                                # 현재 선택된 상품에 해당하는 테이블 찾기
                                # 각 테이블의 순서가 옵션의 순서와 일치한다고 가정
                                target_table_idx = i  # 현재 상품의 인덱스
                                
                                if target_table_idx < len(tables):
                                    table = tables[target_table_idx]
                                    print(f"    -> 대상 테이블: {target_table_idx + 1}번째")
                                    
                                    try:
                                        rows = table.find_elements(By.TAG_NAME, "tr")
                                        if len(rows) >= 2:  # 헤더와 데이터 행이 있는지 확인
                                            
                                            # 테이블의 유효성 검사 - 금리 관련 헤더가 있는지 확인
                                            has_rate_header = False
                                            header_row_idx = -1
                                            
                                            for row_idx, row in enumerate(rows):
                                                headers = row.find_elements(By.TAG_NAME, "th")
                                                if headers:
                                                    header_texts = [h.text.strip() for h in headers]
                                                    if any("기간" in h or "금리" in h for h in header_texts):
                                                        has_rate_header = True
                                                        header_row_idx = row_idx
                                                        print(f"    -> 헤더: {header_texts}")
                                                        break
                                            
                                            if has_rate_header:
                                                # 데이터 행만 처리 (헤더 이후 행들)
                                                data_rows = rows[header_row_idx + 1:] if header_row_idx >= 0 else rows[1:]
                                                
                                                for row in data_rows:
                                                    cells = row.find_elements(By.TAG_NAME, "td")
                                                    if len(cells) >= 2:
                                                        cell_texts = [cell.text.strip() for cell in cells]
                                                        
                                                        # 빈 행이거나 무의미한 행 건너뛰기
                                                        if not any(cell_texts) or all(not text for text in cell_texts):
                                                            continue
                                                        
                                                        print(f"    -> 행 데이터: {cell_texts}")
                                                        
                                                        # 기간과 금리 정보 추출 (헤더에 따라 동적으로 처리)
                                                        row_data = {}
                                                        
                                                        # 헤더와 셀 데이터를 매칭
                                                        for idx, cell_text in enumerate(cell_texts):
                                                            if idx < len(header_texts):
                                                                header_key = header_texts[idx]
                                                                row_data[header_key] = cell_text
                                                            else:
                                                                # 헤더보다 셀이 많은 경우 추가 컬럼으로 처리
                                                                row_data[f"추가컬럼{idx - len(header_texts) + 1}"] = cell_text
                                                        
                                                        # 유효한 데이터인지 확인 (최소한 하나의 셀에 의미있는 데이터가 있는지)
                                                        if any(text.strip() for text in cell_texts):
                                                            rate_info_list.append(row_data)
                                            else:
                                                print(f"    -> 테이블 {target_table_idx + 1}: 금리 헤더 없음")
                                        else:
                                            print(f"    -> 테이블 {target_table_idx + 1}: 행 수 부족 ({len(rows)}개)")
                                            
                                    except Exception as e:
                                        print(f"    -> 테이블 {target_table_idx + 1} 처리 중 오류: {e}")
                                else:
                                    print(f"    -> 대상 테이블 인덱스 {target_table_idx}가 범위를 벗어남 (총 {len(tables)}개)")
                                
                                # 결과 저장
                                if rate_info_list:
                                    # 헤더 정보와 함께 저장
                                    rate_data[product_name] = {
                                        "헤더": header_texts if 'header_texts' in locals() else [],
                                        "데이터": rate_info_list
                                    }
                                    print(f"    -> ✅ {product_name} 정보: {len(rate_info_list)}개 항목")
                                    for i, item in enumerate(rate_info_list[:3]):  # 처음 3개만 출력
                                        if isinstance(item, dict):
                                            item_str = ", ".join([f"{k}: {v}" for k, v in item.items() if v.strip()])
                                            print(f"       📊 {item_str}")
                                    if len(rate_info_list) > 3:
                                        print(f"       ... 총 {len(rate_info_list)}개 항목")
                                else:
                                    print(f"    -> ❌ {product_name} 정보 없음")
                                    rate_data[product_name] = {
                                        "헤더": header_texts if 'header_texts' in locals() else [],
                                        "데이터": []
                                    }
                                        
                            except Exception as e:
                                print(f"    -> 정보 div 찾기 실패: {e}")
                                rate_data[product_name] = {
                                    "헤더": [],
                                    "데이터": [],
                                    "오류": str(e)
                                }
                                
                        except Exception as e:
                            print(f"    -> 상품 페이지 로드 실패: {e}")
                            rate_data[product_name] = {
                                "헤더": [],
                                "데이터": [],
                                "오류": str(e)
                            }
                            
                except Exception as e:
                    print(f"  {category['name']} 카테고리 선택박스 처리 실패: {e}")
                    
            except Exception as e:
                print(f"  {category['name']} 카테고리 로드 실패: {e}")
                
    except Exception as e:
        print(f"전체 처리 중 오류: {e}")
        
    finally:
        driver.quit()
        
    return rate_data

# 3. 크롤링된 데이터를 새로운 JSON 파일로 저장
print("=== 하나은행 금리 정보 수집 시작 ===")
rate_data = get_hana_rates_selenium()
print(f"=== 총 {len(rate_data)}개 상품의 정보 수집 완료 ===")

# 4. 새로운 JSON 파일로 저장
CRAWLED_DATA_FILE = "hana_crawled_rates.json"
with open(CRAWLED_DATA_FILE, "w", encoding="utf-8") as f:
    json.dump(rate_data, f, ensure_ascii=False, indent=2)

print(f"크롤링된 데이터 저장 완료 → {CRAWLED_DATA_FILE}")

# 5. 기존 방식도 유지 (호환성을 위해)
rate_names = list(rate_data.keys())

# 6. JSON 업데이트 (유사도 매칭)
for product in products:
    if product.get("금리") == "금리안내":
        name = product.get("상품명", "")

        # 가장 비슷한 이름 찾기
        match = process.extractOne(name, rate_names, scorer=fuzz.token_sort_ratio)
        if match and match[1] >= 80:  # 유사도 80% 이상
            matched_name = match[0]
            matched_rate_data = rate_data[matched_name]
            
            # 새로운 데이터 구조에 맞게 처리
            if isinstance(matched_rate_data, dict) and "데이터" in matched_rate_data:
                # 새로운 형태의 데이터 구조
                rate_info_str = ""
                for data_row in matched_rate_data["데이터"]:
                    if isinstance(data_row, dict):
                        row_str = ", ".join([f"{k}: {v}" for k, v in data_row.items() if v.strip()])
                        rate_info_str += f"{row_str}\n"
                product["금리"] = rate_info_str.strip()
            elif isinstance(matched_rate_data, list):
                # 기존 형태의 데이터 구조 (호환성)
                rate_info_str = ""
                for rate_info in matched_rate_data:
                    if isinstance(rate_info, dict):
                        period = rate_info.get("기간", "")
                        rate = rate_info.get("금리", "")
                        rate_info_str += f"{period}: {rate}\n"
                    else:
                        rate_info_str += str(rate_info) + "\n"
                product["금리"] = rate_info_str.strip()
            else:
                product["금리"] = str(matched_rate_data)
                
            print(f"[매칭] {name} -> {matched_name}")
            print(f"  금리 정보: {product['금리']}")
        else:
            print(f"[매칭 실패] {name}")
            product["금리"] = None  # 매칭 실패 시 None 처리

# 7. 저장
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"총 {len(products)}개 상품 금리 업데이트 완료 → {OUTPUT_FILE}")
print(f"크롤링된 원본 데이터: {CRAWLED_DATA_FILE}")
print(f"기존 제품과 매칭된 데이터: {OUTPUT_FILE}")