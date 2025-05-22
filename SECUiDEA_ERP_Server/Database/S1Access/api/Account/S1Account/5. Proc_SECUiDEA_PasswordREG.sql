IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_PasswordREG]') AND type IN (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].SECUiDEA_PasswordREG
END
GO
CREATE PROCEDURE [dbo].SECUiDEA_PasswordREG
    @Type           NVARCHAR(50)    = 'find',
    @Role           NVARCHAR(50)    = NULL,
    @ID             NVARCHAR(100)   = NULL,
    @Password       NVARCHAR(100)   = NULL,
-- 사용자 관련 데이터
    @UpdateID       INT             = 0,
    @UpdateIP       NVARCHAR(50)    = NULL,
    @UserLanguage   NVARCHAR(10)    = 'kor'
AS 
BEGIN 
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    DECLARE @Result INT = 0;
    DECLARE @Message NVARCHAR(200) = NULL;

-------------------------------------------------------------------------------------------
-- 유효성 검사
-------------------------------------------------------------------------------------------
    -- Role, ID, Password가 NULL이 아니라면 오류 발생
    IF (@Role IS NULL OR @ID IS NULL OR @Password IS NULL)
    BEGIN
        SELECT @Message = 'Check Role, ID, Password. they must not be NULL.';
        RETURN @Result;
    END

-----------------------------------------------------------------------------------------------
-- ROLE에 따른 비밀번호 변경
-----------------------------------------------------------------------------------------------
    IF (@Type = 'change')
    BEGIN 
        -- 협력업체 또는 임직원의 경우
        IF (@Role = 'Cooperation' OR @Role = 'Employee')
        BEGIN 
            
        END
        -- 관리직의 경우
        ELSE IF (@Role = 'Admin')
        BEGIN 
            
        END
    END
    
END