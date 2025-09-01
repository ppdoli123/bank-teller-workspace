const fs = require("fs");
const path = require("path");

function generateSqlToFile() {
  try {
    console.log("--- JSON 파일 읽기를 시작합니다... ---");
    // 파일들을 읽어 JSON 객체로 변환합니다.
    const productCategories = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "hana_products_categorized.json.json"),
        "utf8"
      )
    );
    const productDetails = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "hana_products_with_rates.json"),
        "utf8"
      )
    );
    const crawledRates = JSON.parse(
      fs.readFileSync(path.join(__dirname, "hana_crawled_rates.json"), "utf8")
    );
    console.log("--- 모든 JSON 파일을 성공적으로 읽었습니다. ---\n");

    // 최종 SQL 쿼리를 저장할 배열을 만듭니다.
    const sqlQueries = [];

    // --- 1. DDL (테이블 생성) 구문 정의 ---
    const createCategoryTableDDL = `
-- 상품 카테고리 테이블 생성
CREATE TABLE BANK_TELLER_PRODUCT_CATEGORY (
    CATEGORY_ID NUMBER PRIMARY KEY,
    CATEGORY_NAME VARCHAR2(255) NOT NULL
);
`;
    const createProductTableDDL = `
-- 상품 테이블 생성
CREATE TABLE BANK_TELLER_PRODUCT (
    PRODUCT_ID NUMBER PRIMARY KEY,
    CATEGORY_ID NUMBER,
    PRODUCT_NAME VARCHAR2(255),
    ATTRIBUTES CLOB,
    FOREIGN KEY (CATEGORY_ID) REFERENCES BANK_TELLER_PRODUCT_CATEGORY(CATEGORY_ID)
);
`;
    sqlQueries.push(createCategoryTableDDL);
    sqlQueries.push(createProductTableDDL);

    // --- 2. 카테고리 INSERT 문 생성 ---
    let categoryId = 1;
    const categoryNameToIdMap = {};
    for (const categoryName in productCategories) {
      const categoryNameEscaped = categoryName.replace(/'/g, "''");
      sqlQueries.push(
        `INSERT INTO BANK_TELLER_PRODUCT_CATEGORY (CATEGORY_ID, CATEGORY_NAME) VALUES (${categoryId}, '${categoryNameEscaped}');`
      );
      categoryNameToIdMap[categoryName] = categoryId;
      categoryId++;
    }

    // --- 3. 상품(Product) INSERT 문 생성 ---
    let productId = 101;
    for (const categoryName in productCategories) {
      const productsInCategory = productCategories[categoryName];
      const currentCategoryId = categoryNameToIdMap[categoryName];

      productsInCategory.forEach((productName) => {
        const trimmedProductName = productName.trim();
        const details = productDetails.find(
          (p) => p.상품명 && p.상품명.trim() === trimmedProductName
        );

        if (details) {
          const attributes = { ...details };
          delete attributes.상품명;

          const rateInfo = crawledRates[trimmedProductName];
          if (rateInfo) {
            attributes.crawled_rate = rateInfo;
          }

          const attributesJsonString = JSON.stringify(attributes);
          const finalAttributes = attributesJsonString.replace(/'/g, "''");
          const productNameEscaped = trimmedProductName.replace(/'/g, "''");

          const insertQuery = `INSERT INTO BANK_TELLER_PRODUCT (PRODUCT_ID, CATEGORY_ID, PRODUCT_NAME, ATTRIBUTES) VALUES (${productId}, ${currentCategoryId}, '${productNameEscaped}', '${finalAttributes}');`;
          sqlQueries.push(insertQuery);
          productId++;
        } else {
          // 찾지 못한 상품은 콘솔에 경고만 표시하고 넘어갑니다.
          console.warn(
            `[경고] 상품명 '${trimmedProductName}'에 대한 상세 정보를 찾지 못했습니다.`
          );
        }
      });
    }

    // ★★★ 핵심 수정: 모든 SQL 쿼리를 하나의 문자열로 합친 후 파일에 저장 ★★★
    const finalSqlScript = sqlQueries.join("\n\n"); // 각 쿼리 사이에 두 줄 띄어쓰기 추가
    const outputFilePath = path.join(__dirname, "output.sql");

    fs.writeFileSync(outputFilePath, finalSqlScript);

    console.log(`\n========================================================`);
    console.log(
      `✅ SQL 스크립트가 '${outputFilePath}' 파일로 성공적으로 저장되었습니다.`
    );
    console.log(`========================================================`);
  } catch (error) {
    console.error("파일 처리 중 오류 발생:", error);
  }
}

// 스크립트 실행
generateSqlToFile();
