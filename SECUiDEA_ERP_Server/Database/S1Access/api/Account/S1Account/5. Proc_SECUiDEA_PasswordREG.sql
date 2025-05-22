IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_PasswordREG]') AND type IN (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].SECUiDEA_PasswordREG
END
GO
CREATE PROCEDURE [dbo].SECUiDEA_PasswordREG
    @Type           NVARCHAR(50)    = 'find',
    @Role           NVARCHAR(50)    = NULL,
    @UID            INT             = NULL,
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
    -- Role, Password가 NULL, ID 와 UID가 둘 다 NULL 이면 오류 발생
    IF (@Role IS NULL OR @Password IS NULL
        OR (@ID IS NULL AND @UID IS NULL))
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
            -- ID가 NULL인 경우에는 UID로 검색
            IF (@ID IS NULL)
            BEGIN
                SELECT  @ID = Sabun
                FROM    Person
                WHERE   PID = @UID
            END
            
            -- 만약, ID가 NULL인 경우에는 오류 발생
            IF (@ID IS NULL)
            BEGIN
                SELECT @Message = 'There might be an incorrect UID.';
                RETURN @Result;
            END
            
            -- 비밀번호 변경
            UPDATE Person
            SET Password = @Password,
                UpdateID = @UpdateID,
                UpdateIP = @UpdateIP
            WHERE Sabun = @ID
            
            SET @Result = 1;
        END
        -- 관리직의 경우
        ELSE IF (@Role = 'Admin')
        BEGIN 
            -- ID가 NULL인 경우에는 UID로 검색
            IF (@ID IS NULL)
            BEGIN 
                SELECT @ID = ID
                FROM  EqUser
                WHERE EqUserID = @UID
            END
            
            -- 만약, ID가 NULL인 경우에는 오류 발생
            IF (@ID IS NULL)
            BEGIN 
                SELECT @Message = 'There might be an incorrect UID.';
                RETURN @Result;
            END
            
            -- 비밀번호 변경
            UPDATE EqUser
            SET Password = @Password,
                UpdateID = @UpdateID,
                UpdateIP = @UpdateIP
            WHERE ID = @ID
            
            SET @Result = 1;
        END
    END
    
    RETURN @Result;
END