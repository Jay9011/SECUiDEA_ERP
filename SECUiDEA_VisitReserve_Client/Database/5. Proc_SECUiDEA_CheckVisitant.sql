IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_CheckVisitant]') AND type in (N'P', N'PC'))
    DROP PROCEDURE SECUiDEA_CheckVisitant
GO
CREATE PROCEDURE SECUiDEA_CheckVisitant
    @VisitantName       NVARCHAR(50)    = NULL
,   @VisitantYMD        NVARCHAR(8)     = NULL
,   @Mobile             VARCHAR(68)     = NULL
AS
BEGIN 
    SET NOCOUNT ON;
    
    DECLARE @VisitantID INT = NULL;
    DECLARE @Result INT = 0;        -- 0: 없음, 1: 있지만 교육 받아야 함, 2: 교육 이수
    DECLARE @Education BIT = NULL;
    DECLARE @EducationDATE DATETIME = NULL;
    DECLARE @Message NVARCHAR(200) = NULL;
    
    -- 빈 값을 NULL로 설정
    SET @VisitantName = NULLIF(@VisitantName, '')
    SET @VisitantYMD = NULLIF(@VisitantYMD, '')
    SET @Mobile = NULLIF(@Mobile, '')
    
    -- 만약 VisitantYMD가 NULL이고 Mobile이 NULL이 아니라면 Mobile 뒤 8자리로 VisitantYMD 설정
    IF (@VisitantYMD IS NULL AND @Mobile IS NOT NULL)
    BEGIN
        SET @VisitantYMD = RIGHT(@Mobile, 8);
    END
    
    -- 만약 VisitantName, VisitantYMD, Mobile이 모두 NULL이라면 오류 발생
    IF (@VisitantName IS NULL AND @VisitantYMD IS NULL AND @Mobile IS NULL)
    BEGIN 
        RAISERROR('VisitantName, VisitantYMD, Mobile 을 확인해 주세요.', 16, 1);
        RETURN @Result;
    END
    
    -- 내방객 정보 확인
    SELECT  @VisitantID = VisitantID
        ,   @Education = Education
        ,   @EducationDATE = EducationDate
    FROM Visitant
    WHERE VisitantName = @VisitantName
      AND VisitantYMD = @VisitantYMD
    ;
    
    -- 내방객 정보가 없다면 오류 발생
    IF (@VisitantID IS NULL)
    BEGIN 
        RAISERROR('내방객 정보가 없습니다.', 16, 1);
        RETURN @Result;
    END
    
    -------------------------------------------------------------------------------------
    -- 내방객 정보가 있다면 결과 반환
    -------------------------------------------------------------------------------------
    SET @Result = 1;
    
    -- Education이 true고 EducationDate가 NULL이 아니면서 EducationDate가 오늘로부터 3개월 이내라면
    IF (@Education = 1 AND @EducationDATE IS NOT NULL AND DATEDIFF(MONTH, @EducationDATE, GETDATE()) <= 3)
    BEGIN
        SET @Result = 2;
    END
    
    SELECT  @VisitantID AS VisitantID
        ,   ISNULL(@Education, 0) AS Education
        ,   ISNULL(@EducationDATE, 0) AS EducationDate
    ;
    RETURN @Result;
END