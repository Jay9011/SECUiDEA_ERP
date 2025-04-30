USE [SECUiDEA]
GO
IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_UpdateRefreshToken]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_UpdateRefreshToken]
GO
CREATE PROCEDURE Auth_UpdateRefreshToken
    @Token            NVARCHAR(255) = NULL,
    @IsRevoked        BIT           = NULL,
    @RevokedAt        DATETIME      = NULL,
    @RevokedByIp      NVARCHAR(50)  = NULL,
    @ReasonRevoked    NVARCHAR(255) = NULL,
    @ReplacedByToken  NVARCHAR(255) = NULL,
    @LastActivityDate DATETIME      = NULL
AS
BEGIN
    UPDATE RefreshTokens
    SET 
        IsRevoked = @IsRevoked,
        RevokedAt = @RevokedAt,
        RevokedByIp = @RevokedByIp,
        ReasonRevoked = @ReasonRevoked,
        ReplacedByToken = @ReplacedByToken,
        LastActivityDate = CASE WHEN @LastActivityDate IS NOT NULL THEN @LastActivityDate ELSE LastActivityDate END
    WHERE Token = @Token;
END