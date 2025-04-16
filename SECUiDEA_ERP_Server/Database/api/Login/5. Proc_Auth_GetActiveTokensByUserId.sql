USE [SECUiDEA]
GO
IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_GetActiveTokensByUserId]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_GetActiveTokensByUserId]
GO
CREATE PROCEDURE Auth_GetActiveTokensByUserId
    @Provider   NVARCHAR(100) = NULL,
    @UserId     NVARCHAR(100) = NULL
AS
BEGIN 
    SELECT 
        Id,
        SessionId,
        Provider,
        UserId,
        Token,
        ExpiryDate,
        CreatedByIp,
        CreatedAt,
        IsRevoked,
        RevokedAt,
        RevokedByIp,
        ReplacedByToken,
        ReasonRevoked,
        LastActivityDate
    FROM RefreshTokens
    WHERE Provider = @Provider
      AND UserId = @UserId
      AND IsRevoked = 0
      AND ExpiryDate > GETDATE();
END