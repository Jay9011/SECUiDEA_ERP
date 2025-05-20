IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_EducationREG]') AND type in (N'P', N'PC'))
    DROP PROCEDURE SECUiDEA_EducationREG
GO
CREATE PROCEDURE SECUiDEA_EducationREG
    @VisitantID         INT
,   @CompletionType     INT             = 1     -- 1이 기본 교육 완료
-- 사용자 ID
,	@UpdateID			INT				= 0
,	@UpdateIP			VARCHAR(15)		= '127.0.0.1'
AS
BEGIN    
    SET NOCOUNT ON;

    DECLARE @Result INT = 0;

    -- 내방객 정보 확인 후 교육 완료 업데이트
    IF EXISTS(SELECT TOP(1) * FROM Visitant WHERE VisitantID = @VisitantID)
    BEGIN
        UPDATE  Visitant
        SET     Education = @CompletionType
            ,   EducationDate = GETDATE()
            ,   UpdateIP = @UpdateIP
        WHERE   VisitantID = @VisitantID
        ;
        SET @Result = 1;
        
        RETURN @Result;
    END

    RETURN @Result;
END