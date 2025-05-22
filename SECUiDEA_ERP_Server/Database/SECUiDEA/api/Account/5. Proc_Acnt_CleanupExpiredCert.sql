IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CleanupExpiredCert]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[CleanupExpiredCert]
GO
CREATE PROCEDURE [dbo].[CleanupExpiredCert]
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

    -- 만료된 인증서 삭제
    DELETE FROM PassCert
    WHERE ExpiredDate < GETDATE();
END