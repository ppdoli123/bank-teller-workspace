// 파일 시스템 모듈을 불러옵니다.
const fs = require("fs");
const path = require("path");

// --- DML 생성을 위한 함수 ---
function generateDML() {
  try {
    // --- 1. JSON 파일 불러오기 ---
    // 파일 경로를 설정합니다. __dirname은 현재 파일이 위치한 디렉토리 경로입니다.
    const productCategoriesPath = path.join(
      __dirname,
      "hana_products_categorized.json.json"
    );
    const productDetailsPath = path.join(
      __dirname,
      "hana_products_with_rates.json"
    );
    const crawledRatesPath = path.join(__dirname, "hana_crawled_rates.json");

    // 동기적으로 파일을 읽고 JSON으로 파싱합니다.
    const productCategories = JSON.parse(
      fs.readFileSync(productCategoriesPath, "utf8")
    );
    const productDetails = JSON.parse(
      fs.readFileSync(productDetailsPath, "utf8")
    );
    const crawledRates = JSON.parse(fs.readFileSync(crawledRatesPath, "utf8"));
    // --- 카테고리 INSERT 문 생성 ---
    console.log("-- 1. 상품 카테고리 테이블 INSERT 문 생성 --");
    let categoryId = 1;
    const categoryInserts = [];
    // categoryNameToIdMap 객체는 '예금' -> 1, '적금' -> 2 와 같이 이름과 ID를 매핑하여 기억하는 용도입니다.
    // 나중에 상품 정보를 넣을 때 이 정보를 사용합니다.
    const categoryNameToIdMap = {};
    for (const categoryName in productCategories) {
      const categoryNameEscaped = categoryName.replace(/'/g, "''");
      categoryInserts.push(
        `INSERT INTO BANK_TELLER_PRODUCT_CATEGORY (CATEGORY_ID, CATEGORY_NAME) VALUES (${categoryId}, '${categoryNameEscaped}');`
      );
      categoryNameToIdMap[categoryName] = categoryId; // '예금'의 ID는 1이라고 기억!
      categoryId++;
    }
    console.log(categoryInserts.join("\n"));

    // --- 3. 상품 테이블 INSERT 문 생성 ---
    let productId = 101;
    const productInserts = [];

    for (const categoryName in productCategories) {
      const productsInCategory = productCategories[categoryName];
      const currentCategoryId = categoryNameToIdMap[categoryName];

      productsInCategory.forEach((productName) => {
        const details = productDetails.find((p) => p.상품명 === productName);

        if (details) {
          // crawledRates에서 상품명으로 금리 정보 조회
          const rateInfo = crawledRates[productName];
          let preferentialRate = null;

          if (rateInfo && rateInfo.데이터 && rateInfo.데이터.length > 0) {
            // '데이터' 배열을 문자열로 변환하여 저장
            // 예: "기간: 1년, 금리(연율,세전): 2.95%"
            preferentialRate = rateInfo.데이터
              .map((item) =>
                Object.entries(item)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")
              )
              .join(" / ");
          }

          // 작은따옴표(') 이스케이프 처리 및 null 값 처리
          const productNameEscaped = details.상품명.replace(/'/g, "''");
          const productFeatureEscaped = details.상품특징
            ? `'${details.상품특징.replace(/'/g, "''")}'`
            : "NULL";
          const eligibilityEscaped = details.가입대상
            ? `'${details.가입대상.replace(/'/g, "''")}'`
            : "NULL";
          const termEscaped = details.가입기간
            ? `'${details.가입기간.replace(/'/g, "''")}'`
            : "NULL";
          const interestRateEscaped = details.금리
            ? `'${details.금리.replace(/'/g, "''")}'`
            : "NULL";
          const preferentialRateEscaped = preferentialRate
            ? `'${preferentialRate.replace(/'/g, "''")}'`
            : "NULL";

          const insertQuery = `INSERT INTO BANK_TELLER_PRODUCT (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, PRODUCT_FEATURE, ELIGIBILITY, TERM, INTEREST_RATE, PREFERENTIAL_RATE) VALUES (${productId}, ${currentCategoryId}, '${productNameEscaped}', ${productFeatureEscaped}, ${eligibilityEscaped}, ${termEscaped}, ${interestRateEscaped}, ${preferentialRateEscaped});`;
          productInserts.push(insertQuery);
          productId++;
        } else {
          // 매칭되지 않는 상품명도 기본 정보만으로 INSERT
          const productNameEscaped = productName.replace(/'/g, "''");
          const insertQuery = `INSERT INTO BANK_TELLER_PRODUCT (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, PRODUCT_FEATURE, ELIGIBILITY, TERM, INTEREST_RATE, PREFERENTIAL_RATE) VALUES (${productId}, ${currentCategoryId}, '${productNameEscaped}', NULL, NULL, NULL, NULL, NULL);`;
          productInserts.push(insertQuery);
          productId++;
          console.log(
            `⚠️ 매칭되지 않는 상품명: ${productName} (기본 정보만으로 INSERT)`
          );
        }
      });
    }

    console.log("\n-- 상품 테이블 INSERT 문 (우대금리 포함) --");
    console.log(productInserts.join("\n"));

    // 매칭되지 않는 상품명들 출력
    console.log("\n-- 매칭되지 않는 상품명들 --");
    let unmatchedCount = 0;
    for (const categoryName in productCategories) {
      const productsInCategory = productCategories[categoryName];
      productsInCategory.forEach((productName) => {
        const details = productDetails.find((p) => p.상품명 === productName);
        if (!details) {
          console.log(
            `⚠️ 매칭되지 않는 상품명: ${productName} (카테고리: ${categoryName})`
          );
          unmatchedCount++;
        }
      });
    }
    console.log(`\n총 ${unmatchedCount}개의 상품이 매칭되지 않았습니다.`);
  } catch (error) {
    console.error("파일을 읽거나 처리하는 중 오류가 발생했습니다:", error);
  }
}

// DML 생성 함수 실행
generateDML();
