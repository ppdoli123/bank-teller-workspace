import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

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
        
        # 선택 박스 찾기
        select_element = wait.until(EC.presence_of_element_located((By.NAME, "sel1")))
        select = Select(select_element)
        
        # 모든 옵션 가져오기
        options = select.options
        print(f"총 {len(options)}개 상품 발견")
        
        # 처음 몇 개 상품만 테스트
        for i, option in enumerate(options[1:6]):  # 첫 번째는 "전체보기"이므로 제외, 5개만 테스트
            value = option.get_attribute("value")
            product_name = option.text.strip()
            
            if not value or value == '0':
                continue
                
            print(f"처리중: {product_name}")
            
            try:
                # 상품 선택
                select.select_by_value(value)
                
                # 잠시 대기 (페이지가 업데이트될 시간)
                time.sleep(2)
                
                # 금리 정보가 표시되는 영역 찾기
                try:
                    rate_div = driver.find_element(By.ID, "hanaContentDiv_rate")
                    
                    # 테이블에서 금리 정보 찾기
                    tables = rate_div.find_elements(By.TAG_NAME, "table")
                    for table in tables:
                        rows = table.find_elements(By.TAG_NAME, "tr")
                        for row in rows:
                            cells = row.find_elements(By.TAG_NAME, "td")
                            if len(cells) >= 2:
                                for cell in cells:
                                    text = cell.text.strip()
                                    # 금리로 보이는 패턴 (숫자 + %)
                                    if '%' in text and any(c.isdigit() for c in text):
                                        rate_data[product_name] = text
                                        print(f"  -> 금리: {text}")
                                        break
                                if product_name in rate_data:
                                    break
                        if product_name in rate_data:
                            break
                    
                    # 금리를 찾지 못한 경우 div의 전체 텍스트에서 찾기
                    if product_name not in rate_data:
                        div_text = rate_div.text
                        print(f"  -> div 내용: {div_text[:200]}")
                        # 텍스트에서 금리 패턴 찾기
                        import re
                        rate_pattern = r'(\d+\.?\d*%)'
                        matches = re.findall(rate_pattern, div_text)
                        if matches:
                            rate_data[product_name] = matches[0]
                            print(f"  -> 금리 (패턴매칭): {matches[0]}")
                        else:
                            print(f"  -> 금리 정보 없음")
                            
                except Exception as e:
                    print(f"  -> 금리 div 찾기 실패: {e}")
                    
            except Exception as e:
                print(f"  -> 상품 선택 실패: {e}")
                
    except Exception as e:
        print(f"전체 처리 중 오류: {e}")
        
    finally:
        driver.quit()
        
    return rate_data

if __name__ == "__main__":
    print("=== Selenium을 사용한 하나은행 금리 정보 수집 ===")
    rates = get_hana_rates_selenium()
    print(f"\n=== 수집된 금리 정보 ({len(rates)}개) ===")
    for product, rate in rates.items():
        print(f"{product}: {rate}")
