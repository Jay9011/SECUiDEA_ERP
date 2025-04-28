IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_VisitReserve]') AND type in (N'P', N'PC'))
    DROP PROCEDURE SECUiDEA_VisitReserve
GO
CREATE PROCEDURE SECUiDEA_VisitReserve
    @Type               NVARCHAR(50)    = 'reg'
,   @VisitantName       NVARCHAR(50)
,   @Mobile             VARCHAR(68)
,   @PID                INT             = 0
,   @RegisterPID        INT             = NULL
,   @VisitantCompany    NVARCHAR(50)    = ''
,   @Email              NVARCHAR(100)   = ''
,   @VisitSDate         DATETIME
,   @VisitEDate         DATETIME        = NULL
,   @VisitReasonText    NVARCHAR(200)   = ''
,   @LicensePlateNumber NVARCHAR(50)    = ''
-- 개인정보 동의 관련
,   @Agreement          INT             = 0
,   @AgreementDate      DATETIME        = NULL
-- 기타 정보
,   @VisitantAddress    NVARCHAR(200)   = ''
,   @VisitantOfficeTel  NVARCHAR(50)    = ''
-- 사용자 ID
,	@UpdateID			INT				= 0
,	@UpdateIP			VARCHAR(15)		= '127.0.0.1'
AS
BEGIN 
    SET NOCOUNT ON;
    
    SET @Type = LOWER(@Type)
    
    IF (@UpdateID < 0)
    BEGIN 
        SET @UpdateID = 0;
    END

    DECLARE @Result INT = 0;
    DECLARE @VisitantID INT = NULL;
    DECLARE @VisitReserveID INT = NULL;
    DECLARE @VisitReserveVisitantID INT = NULL;
    DECLARE @VisitantYMD NVARCHAR(8) = NULL;
    
    -- Mobile 뒷자리 8자리로 VisitantYMD 설정 (Visitant 테이블 수정이 끝나 있어야 함)
    SET @VisitantYMD = RIGHT(@Mobile, 8);
---------------------------------------------------------------------------------------------------------
-- 방문 신청
---------------------------------------------------------------------------------------------------------
    IF (@Type = 'reg')
    BEGIN 
        ---------------------------------------------------------------------------------------------------------
        -- 내방객 관련 처리
        ---------------------------------------------------------------------------------------------------------
        -- 내방객 정보가 이미 있는지 확인
        SELECT @VisitantID = VisitantID
        FROM Visitant
        WHERE VisitantName = @VisitantName
          AND VisitantYMD = @VisitantYMD
        ;
    
        -- 내방객 정보가 없는 경우 새로 추가
        IF (@VisitantID IS NULL)
        BEGIN
            INSERT INTO Visitant 
                ([VisitantName], [VisitantYMD], [VisitantCompany], 
                 [Address], [OfficeTel], [Mobile],
                 [Agreement], [AgreementDate], [SignImage], 
                 [InsertDate], [UpdateDate], [UpdateID], [UpdateIP])
            VALUES (@VisitantName, @VisitantYMD, @VisitantCompany
                ,   @VisitantAddress, @VisitantOfficeTel, @Mobile
                ,   0, NULL, 0x00
                ,   getdate(), NULL
                ,   @UpdateID
                ,   @UpdateIP
            )
            ;
            SET @VisitantID = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN 
            -- 내방객 정보가 있는 경우 업데이트
            UPDATE  Visitant
            SET     VisitantCompany = ISNULL(NULLIF(NULLIF(@VisitantCompany, ''), 0), VisitantCompany)
                ,   Address = ISNULL(NULLIF(NULLIF(@VisitantAddress, ''), 0), Address)
                ,   OfficeTel = ISNULL(NULLIF(NULLIF(@VisitantOfficeTel, ''), 0), OfficeTel)
                ,   UpdateDate = getdate()
                ,   UpdateID = CASE WHEN @UpdateID < 0 THEN 0 ELSE @UpdateID END
                ,   UpdateIP = @UpdateIP
            WHERE   VisitantID = @VisitantID;
        END
        ;
        
        ---------------------------------------------------------------------------------------------------------
        -- 방문 예약 처리
        ---------------------------------------------------------------------------------------------------------
        INSERT INTO VisitReserve 
            (PID, RegisterPID, 
             VisitSDate, VisitEDate, 
             VisitStatusID, VisitReasonText, 
             VisitProtocol,
             InsertDate, UpdateID, UpdateIP)
        VALUES
            (@PID, @RegisterPID, 
             @VisitSDate, @VisitEDate, 
             0, @VisitReasonText,
             0,
             getdate(), @UpdateID, @UpdateIP)
        ;
        SET @VisitReserveID = SCOPE_IDENTITY();
        
        ---------------------------------------------------------------------------------------------------------
        -- 방문 예약 - 방문자 매핑 처리
        ---------------------------------------------------------------------------------------------------------
        INSERT INTO VisitReserveVisitant
            (VisitID, VisitantID, PID,
             LicensePlateNumber,
             VisitStatusID,
             InsertDate, updateID, UpdateIP)
        VALUES 
            (@VisitReserveID, @VisitantID, 0,
             @LicensePlateNumber,
             0,
             getdate(), @UpdateID, @UpdateIP
             )
        ;
        SET @VisitReserveVisitantID = SCOPE_IDENTITY();
        
        SET @Result = 1;
        SELECT @VisitantID AS VisitantID
        
        RETURN @Result;
    END
END