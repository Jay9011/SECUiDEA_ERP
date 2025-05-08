IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_SessionInsert]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_SessionInsert]
GO
CREATE PROCEDURE Auth_SessionInsert
    @Provider          NVARCHAR(100)    = NULL,
    @UserId            NVARCHAR(100)    = NULL,
    @SessionId         NVARCHAR(100)    = NULL,
    @IpAddress         NVARCHAR(50)     = NULL,
    @CreatedAt         DATETIME         = NULL,
    @LastActivityAt    DATETIME         = NULL,
    @IsActive          BIT              = NULL,
    @ExpiryDate        DATETIME         = NULL
AS 
BEGIN 
    INSERT INTO UserSessions 
    (
        Provider,
        UserId,
        SessionId,
        IpAddress,
        CreatedAt,
        LastActivityAt,
        IsActive,
        ExpiryDate
    )
    VALUES
    (
        @Provider,
        @UserId,
        @SessionId,
        @IpAddress,
        @CreatedAt,
        @LastActivityAt,
        @IsActive,
        @ExpiryDate
    )
END