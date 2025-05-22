IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PassCert_Mobile]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[PassCert_Mobile]
GO
-- 모바일 인증용 인증 번호 생성 및 확인 프로시저
CREATE PROCEDURE [dbo].[PassCert_Mobile]
    @Type               NVARCHAR(50)    = 'reg',
    @Mobile             NVARCHAR(50)    = NULL,
    @CertificateData    NVARCHAR(50)    = NULL,
    @IssuedDate         DATETIME        = NULL,
    @ExpiredDate        DATETIME        = NULL,
    @UpdateIP           NVARCHAR(50)    = NULL
AS
BEGIN 
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    DECLARE @Result INT = 0;
    DECLARE @Message NVARCHAR(200) = NULL;

    -- 유효성 검사
    IF (@Type IS NULL OR @Mobile IS NULL)
    BEGIN
        SELECT @Message = 'Check Type, Mobile. they must not be NULL.';
    END

    -- 인증 번호 등록
    IF (@Type = 'reg')
    BEGIN
        -- 지금 인증번호 만료일은 5분으로 설정 (추후 변경하거나 DB 설정에서 관리하도록 변경 필요)
        INSERT INTO PassCert (Mobile, CertificateData, IssuedDate, ExpiredDate, UpdateIP)
        VALUES (@Mobile, @CertificateData, GETDATE(), DATEADD(MINUTE, 5, GETDATE()), @UpdateIP);
        
        SET @Result = 1;
        SET @Message = 'Certificate registered successfully.';
    END
    -- 인증 번호 확인
    ELSE IF (@Type = 'check')
    BEGIN
        -- 현재는 인증번호가 만료되었더라고 1~2초 사이에 인증번호가 삭제되지 않았다면 유효한 것으로 간주
        SELECT  @Result = COUNT(*)
        FROM    PassCert
        WHERE   Mobile = @Mobile
          AND   CertificateData = @CertificateData

        IF (@Result > 0)
        BEGIN 
            SET @Message = 'Certificate is valid.';
            SET @Result = 1;
        END
        ELSE
        BEGIN
            SET @Message = 'Certificate is invalid or expired.';
        END 
    END

    -- 결과 반환
    SELECT @Message AS Message;
    RETURN @Result;
END