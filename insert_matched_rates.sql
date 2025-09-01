-- ProductRate 데이터 삽입
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR001', 'P004_아이꿈하나적금', 12, 2.95, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR002', 'P001_급여하나월복리적금', 12, 2.75, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR003', 'P001_급여하나월복리적금', 24, 2.8, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR004', 'P001_급여하나월복리적금', 36, 2.85, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR005', 'P002_연금하나월복리적금', 12, 2.95, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR006', 'P002_연금하나월복리적금', 24, 3.0, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR007', 'P002_연금하나월복리적금', 36, 3.1, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR008', 'P003_주거래하나월복리적금', 12, 2.75, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR009', 'P003_주거래하나월복리적금', 24, 2.8, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR010', 'P003_주거래하나월복리적금', 36, 2.85, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR011', 'P005_하나장병내일준비적금', 1, 3.5, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR012', 'P005_하나장병내일준비적금', 12, 4.0, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR013', 'P005_하나장병내일준비적금', 15, 5.0, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR014', 'P021_정기예금', 1, 1.6, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR015', 'P021_정기예금', 3, 1.7, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR016', 'P021_정기예금', 6, 1.8, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR017', 'P021_정기예금', 12, 1.85, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR018', 'P021_정기예금', 24, 1.85, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR019', 'P021_정기예금', 36, 1.85, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR020', 'P021_정기예금', 48, 1.85, 1000000, 100000000, '2024-01-01', '2025-12-31');
INSERT INTO ProductRate (RateID, ProductID, PeriodMonths, InterestRate, MinAmount, MaxAmount, EffectiveDate, EndDate) VALUES 
('PR021', 'P021_정기예금', 60, 1.85, 1000000, 100000000, '2024-01-01', '2025-12-31');

-- LoanRate 데이터 삽입
INSERT INTO LoanRate (RateID, ProductID, BaseRate, AdditionalRate, PreferentialRate, MinRate, MaxRate, RateChangeCycle, EffectiveDate, EndDate) VALUES 
('LR001', 'P016_공무원가계자금대출', 3.5, 1.0, 0.5, 2.5, 5.5, '월', '2024-01-01', '2025-12-31');
INSERT INTO LoanRate (RateID, ProductID, BaseRate, AdditionalRate, PreferentialRate, MinRate, MaxRate, RateChangeCycle, EffectiveDate, EndDate) VALUES 
('LR002', 'P014_우량주택전세론', 3.5, 1.0, 0.5, 2.5, 5.5, '월', '2024-01-01', '2025-12-31');
INSERT INTO LoanRate (RateID, ProductID, BaseRate, AdditionalRate, PreferentialRate, MinRate, MaxRate, RateChangeCycle, EffectiveDate, EndDate) VALUES 
('LR003', 'P011_주택신보전세자금대출', 3.5, 1.0, 0.5, 2.5, 5.5, '월', '2024-01-01', '2025-12-31');