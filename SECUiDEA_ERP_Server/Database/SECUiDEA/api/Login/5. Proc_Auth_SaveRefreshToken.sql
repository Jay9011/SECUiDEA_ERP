IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_SaveRefreshToken]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_SaveRefreshToken]
GO
CREATE PROCEDURE Auth_SaveRefreshToken
    @SessionId        NVARCHAR(100) = NULL,
    @Provider         NVARCHAR(100) = NULL,
    @UserId           NVARCHAR(100) = NULL,
    @Token            NVARCHAR(255) = NULL,
    @ExpiryDate       DATETIME      = NULL,
    @CreatedByIp      NVARCHAR(50)  = NULL,
    @CreatedAt        DATETIME      = NULL,
    @LastActivityDate DATETIME      = NULL
AS
BEGIN
    INSERT INTO RefreshTokens
    (
        SessionId,
        Provider,
        UserId,
        Token,
        ExpiryDate,
        CreatedByIp,
        CreatedAt,
        LastActivityDate
    )
    VALUES
    (
        @SessionId,
        @Provider,
        @UserId,
        @Token,
        @ExpiryDate,
        @CreatedByIp,
        @CreatedAt,
        @LastActivityDate
    );
END