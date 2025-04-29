-- Visitant 테이블의 VisitantYMD nvarchar(6)을 nvarchar(8)로 변경
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Visitant' AND COLUMN_NAME = 'VisitantYMD' AND CHARACTER_MAXIMUM_LENGTH = 6
)
BEGIN
    ALTER TABLE Visitant ALTER COLUMN VisitantYMD NVARCHAR(8);
END
-- Visitant 테이블에 Email 컬럼이 없다면 추가
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Visitant' AND COLUMN_NAME = 'Email'
)
BEGIN
    ALTER TABLE Visitant ADD Email NVARCHAR(100);
END
-- Visitant 테이블에 Education bit 컬럼이 없다면 추가
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Visitant' AND COLUMN_NAME = 'Education'
)
BEGIN
    ALTER TABLE Visitant ADD Education BIT;
END
-- Visitant 테이블에 EducationDate datetime 컬럼이 없다면 추가
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Visitant' AND COLUMN_NAME = 'EducationDate'
)
BEGIN
    ALTER TABLE Visitant ADD EducationDate DATETIME;
END