IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_GetRefreshTokenByToken]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_GetRefreshTokenByToken]
GO
CREATE PROCEDURE Auth_GetRefreshTokenByToken
    @Token NVARCHAR(255) = NULL
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
    WHERE Token = @Token;
END