IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_AccountFindSEL]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[SECUiDEA_AccountFindSEL]
GO
CREATE PROCEDURE SECUiDEA_AccountFindSEL
    @Type   NVARCHAR(50) = 'Mobile',
    @Role   NVARCHAR(50) = NULL,
    @ID     NVARCHAR(50) = NULL,
-- 계정 찾기 부가 정보
    @Mobile NVARCHAR(50) = NULL
AS
BEGIN 
    SET NOCOUNT ON;
    
    DECLARE @Result INT = 0;
    DECLARE @Message NVARCHAR(200) = NULL;
    DECLARE @CleanMobile NVARCHAR(50) = NULL;
    
    -- 입력된 Mobile 번호에서 특수문자 제거 및 국가 코드 제거
    SET @CleanMobile = REPLACE(REPLACE(REPLACE(@Mobile, '-', ''), '+', ''), ' ', '');
    
    -- 앞에 82로 시작하는 경우 (국가 코드) 제거
    IF LEFT(@CleanMobile, 2) = '82' 
        SET @CleanMobile = SUBSTRING(@CleanMobile, 3, LEN(@CleanMobile) - 2);
    
    -- 010, 10 같은 패턴 처리 (맨 앞이 0인지 확인)
    IF LEFT(@CleanMobile, 1) = '0'
        SET @CleanMobile = SUBSTRING(@CleanMobile, 2, LEN(@CleanMobile) - 1);
    
    -- 계정 정보가 없으므로 EQUser부터 조회
    IF (@Type = 'Mobile')   -- Mobile과 ID로 조회
    BEGIN 
        IF EXISTS(
            SELECT * FROM EqUser 
            WHERE 
                -- DB에 저장된 Mobile 번호도 동일한 방식으로 정리하여 비교
                (
                    CASE 
                        WHEN LEFT(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 2) = '82' 
                        THEN SUBSTRING(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 3, LEN(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')) - 2)
                        ELSE REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')
                    END
                ) LIKE '%' + @CleanMobile + '%'
                AND ID = @ID
        )
        BEGIN 
            SET @Result = 1;
            SET @Message = 'Account found.';

            SELECT @Message AS Message,
                   'Admin'  AS AuthType
            FROM EqUser
            WHERE 
                (
                    CASE 
                        WHEN LEFT(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 2) = '82' 
                        THEN SUBSTRING(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 3, LEN(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')) - 2)
                        ELSE REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')
                    END
                ) LIKE '%' + @CleanMobile + '%'
                AND ID = @ID;
            RETURN @Result;
        END
        
        IF EXISTS(
            SELECT * FROM Person 
            WHERE 
                (
                    CASE 
                        WHEN LEFT(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 2) = '82' 
                        THEN SUBSTRING(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 3, LEN(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')) - 2)
                        ELSE REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')
                    END
                ) LIKE '%' + @CleanMobile + '%'
                AND Sabun = @ID
        )
        BEGIN 
            SET @Result = 1;
            SET @Message = 'Account found.';

            -- PersonTypeID가 2인 경우에는 협력업체 나머지는 직원
            SELECT @Message AS Message,
                   CASE WHEN PersonTypeID = 2   THEN 'Cooperation'
                                                ELSE 'Employee'
                       END  AS AuthType
            FROM Person
            WHERE 
                (
                    CASE 
                        WHEN LEFT(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 2) = '82' 
                        THEN SUBSTRING(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', ''), 3, LEN(REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')) - 2)
                        ELSE REPLACE(REPLACE(REPLACE(Mobile, '-', ''), '+', ''), ' ', '')
                    END
                ) LIKE '%' + @CleanMobile + '%'
                AND Sabun = @ID;
            RETURN @Result;
        END
        
        -- 계정 정보가 없으면 Fail
        SET @Message = 'There is no account information.';
        SELECT @Message AS Message,
               'None'   AS AuthType
        RETURN @Result;
    END
END