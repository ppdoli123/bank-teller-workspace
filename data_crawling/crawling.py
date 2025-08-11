import os
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException

# 📂 저장 경로
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_DIR = os.path.join(SCRIPT_DIR, "pdf_files")
JSON_FILE = os.path.join(SCRIPT_DIR, "hana_products_with_pdf.json")
os.makedirs(PDF_DIR, exist_ok=True)

# 📌 이전 데이터 불러오기 (재시작)
if os.path.exists(JSON_FILE):
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        results = json.load(f)
else:
    results = []

# 이미 크롤링한 상품명 리스트
crawled_names = {item.get("상품명") for item in results}

# 📌 크롬 드라이버 옵션
options = webdriver.ChromeOptions()
# options.add_argument("--headless") # 헤드리스 모드
options.add_argument("--start-maximized")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 15)

# 📌 리스트 페이지 그룹
list_pages = [
    "https://www.kebhana.com/cont/mall/mall09/mall0902/mall090201/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0902/mall090202/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0902/mall090203/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0902/mall090204/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090301/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090302/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090303/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090304/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090305/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090306/index.jsp",
    "https://www.kebhana.com/cont/mall/mall09/mall0903/mall090307/index.jsp"
]

# 📌 각 카테고리 페이지 순회
for list_url in list_pages:
    print(f"--- 카테고리 시작: {list_url} ---")
    driver.get(list_url)
    time.sleep(2)

    page_count = 1
    max_retries_per_page = 3  # 같은 페이지에서 최대 재시도 횟수
    current_retry_count = 0
    last_processed_url = ""
    
    while True:  # 페이지네이션 반복
        current_url = driver.current_url
        print(f"[리스트 페이지] 현재 URL: {current_url}, 페이지: {page_count}")
        
        # 같은 URL에서 반복되는 경우 체크
        if current_url == last_processed_url:
            current_retry_count += 1
            print(f"[경고] 같은 페이지가 반복됩니다. 재시도 횟수: {current_retry_count}/{max_retries_per_page}")
            if current_retry_count >= max_retries_per_page:
                print("[에러] 같은 페이지에서 최대 재시도 횟수 초과. 다음 카테고리로 이동합니다.")
                break
        else:
            current_retry_count = 0
            last_processed_url = current_url
        
        try:
            # 페이지 로드 대기
            wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "td:nth-child(1) a")))
            product_links = driver.find_elements(By.CSS_SELECTOR, "td:nth-child(1) a")
            
            successful_crawls = 0  # 현재 페이지에서 성공한 크롤링 수
            error_occurred = False  # 현재 페이지에서 에러 발생 여부
            
            for i in range(len(product_links)):
                try:
                    # StaleElementReferenceException 방지
                    product_links = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "td:nth-child(1) a")))
                    link = product_links[i]
                    product_name = link.text.strip()
                    
                    if not product_name:
                        continue

                    # 이미 저장된 상품이면 건너뛰기
                    if product_name in crawled_names:
                        print(f"[스킵] '{product_name}' (이미 크롤링 완료)")
                        continue

                    print(f"  > 상품 크롤링 시작: '{product_name}'")
                    
                    # 상품 링크 클릭
                    link.click()
                    
                    try:
                        # 상품 상세 페이지 로드 대기
                        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "dl.prodcutInfo")))
                        
                        detail_data = {"상품명": product_name}

                        # 📌 dt–dd 쌍 추출
                        try:
                            dts = driver.find_elements(By.CSS_SELECTOR, "dl.prodcutInfo dt")
                            dds = driver.find_elements(By.CSS_SELECTOR, "dl.prodcutInfo dd")
                            if dts and dds:
                                for dt, dd in zip(dts, dds):
                                    dt_text = dt.text.strip()
                                    dd_text = dd.text.strip()
                                    if dt_text and dd_text:
                                        detail_data[dt_text] = dd_text
                        except Exception as e:
                            print(f"[에러] '{product_name}' dt–dd 추출 실패: {e}")
                            
                        # 📌 금리표 추출
                        rate_table_data = []
                        try:
                            table = driver.find_element(By.CSS_SELECTOR, "table.tbl_type")
                            headers = [th.text.strip() for th in table.find_elements(By.CSS_SELECTOR, "thead th")]
                            rows = table.find_elements(By.CSS_SELECTOR, "tbody tr")
                            if headers and rows:
                                for row in rows:
                                    cells = [td.text.strip().replace('%', '') for td in row.find_elements(By.TAG_NAME, "td")]
                                    if len(headers) == len(cells):
                                        rate_table_data.append({headers[i]: cells[i] for i in range(len(headers))})
                        except (NoSuchElementException, IndexError):
                            pass  # 금리표가 없거나 형식이 다를 경우 무시
                        detail_data["금리표"] = rate_table_data
                        
                        # 📌 상품설명서 PDF 다운로드
                        pdf_path = ""
                        try:
                            pdf_link_element = driver.find_element(By.LINK_TEXT, "상품설명서")
                            link1 = pdf_link_element.get_attribute("href")
                            if link1:
                                pdf_data = requests.get(link1).content
                                pdf_filename = f"{product_name.replace('/', '_').replace(':', '')}.pdf"
                                pdf_path = os.path.join(PDF_DIR, pdf_filename)
                                with open(pdf_path, "wb") as f:
                                    f.write(pdf_data)
                                print(f"  > PDF 저장 완료: {pdf_path}")
                        except NoSuchElementException:
                            print(f"  > '{product_name}' 상품설명서 링크 없음")
                        except Exception as e:
                            print(f"  > [에러] '{product_name}' PDF 다운로드 실패: {e}")
                        
                        detail_data["상품설명서_경로"] = pdf_path

                        # 📌 데이터 저장
                        results.append(detail_data)
                        crawled_names.add(product_name)
                        successful_crawls += 1
                        
                        # 즉시 JSON 저장 (중간 저장)
                        with open(JSON_FILE, "w", encoding="utf-8") as f:
                            json.dump(results, f, ensure_ascii=False, indent=2)

                        print(f"  > 데이터 저장 완료: '{product_name}'")
                        
                    except TimeoutException:
                        print(f"[에러] '{product_name}' 상세 페이지 로드 시간 초과. 다음 상품으로 넘어갑니다.")
                        error_occurred = True
                        # 타임아웃 발생한 상품을 크롤링 완료 목록에 추가하여 재시도 방지
                        crawled_names.add(product_name)
                    except Exception as e:
                        print(f"[에러] '{product_name}' 크롤링 중 예상치 못한 오류 발생: {e}")
                        error_occurred = True
                        # 에러 발생한 상품을 크롤링 완료 목록에 추가하여 재시도 방지
                        crawled_names.add(product_name)
                    finally:
                        driver.back()
                        wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "td:nth-child(1) a")))
                        time.sleep(1) # 페이지 리로드 안정화 대기
                
                except StaleElementReferenceException:
                    print("[경고] StaleElementReferenceException 발생. 페이지를 다시 로드하고 재시도합니다.")
                    break # for 루프를 빠져나와 while 루프의 처음으로 돌아감
                except Exception as e:
                    print(f"[에러] 상품 리스트 처리 중 오류 발생: {e}")
                    continue

        except TimeoutException:
            print("[에러] 상품 리스트 페이지 로드 시간 초과. 다음 카테고리로 넘어갑니다.")
            break
        
        # 📌 다음 페이지로 이동
        try:
            # 현재 페이지 번호를 정확히 확인
            actual_current_page = page_count  # 기본값
            
            try:
                # 실제 웹페이지에서 현재 활성화된 페이지 번호 가져오기
                current_page_element = driver.find_element(By.CSS_SELECTOR, "a.on")
                actual_current_page = int(current_page_element.text.strip())
                print(f"  - 웹페이지 실제 현재 페이지: {actual_current_page}")
                
                # 추적 중인 페이지와 실제 페이지가 다르면 동기화
                if actual_current_page != page_count:
                    print(f"  - 페이지 번호 동기화: {page_count} → {actual_current_page}")
                    page_count = actual_current_page
                    
            except (NoSuchElementException, ValueError):
                print(f"  - 현재 페이지 번호를 찾을 수 없음. 추적 중인 페이지 사용: {page_count}")

            # 에러가 발생했거나 모든 상품이 이미 크롤링되었으면 강제로 다음 페이지로
            if error_occurred or successful_crawls == 0:
                print(f"  - 에러 발생 또는 새로운 크롤링 없음. 다음 페이지로 강제 이동")
                next_page = actual_current_page + 1
            else:
                next_page = actual_current_page + 1

            # 다음 페이지 버튼 찾기 및 클릭
            next_page_xpath = f"//div[@class='paging']//a[normalize-space(text())='{next_page}' and not(@class='on')]"
            
            try:
                next_page_btn = wait.until(EC.element_to_be_clickable((By.XPATH, next_page_xpath)))
                print(f"  - 다음 페이지({next_page})로 이동 시도")
                
                # 페이지 이동 전 현재 URL 저장
                before_url = driver.current_url
                next_page_btn.click()
                time.sleep(3)  # 페이지 로드 대기 시간 증가
                
                # 페이지 이동 확인
                after_url = driver.current_url
                if before_url != after_url:
                    print(f"  - 페이지 이동 성공: {before_url} → {after_url}")
                    page_count = next_page
                    current_retry_count = 0  # 성공적으로 이동했으므로 재시도 카운트 리셋
                else:
                    print(f"  - 페이지 이동 실패: URL이 변경되지 않음")
                    raise Exception("페이지 이동 실패")
                    
            except (NoSuchElementException, TimeoutException):
                print("  - 다음 페이지 버튼을 찾을 수 없음. 페이지네이션 마지막으로 판단됩니다.")
                break
            except Exception as e:
                print(f"  - [에러] 다음 페이지 이동 중 오류 발생: {e}")
                break
                
        except Exception as e:
            print(f"  - [에러] 페이지네이션 처리 중 오류 발생: {e}")
            break
        

print(f"총 {len(results)}개 상품 크롤링 완료")
driver.quit()