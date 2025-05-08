IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_GetLatestSession]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_GetLatestSession]
GO
CREATE PROCEDURE Auth_GetLatestSession
    @Provider NVARCHAR(100) = NULL,
    @UserId   NVARCHAR(100) = NULL
AS
BEGIN 
    SELECT TOP 1
        Id,
        Provider,
        UserId,
        SessionId,
        IpAddress,
        CreatedAt,
        LastActivityAt,
        IsActive,
        ExpiryDate,
        DeactivatedAt,
        DeactivatedReason
    FROM UserSessions
    WHERE Provider = @Provider 
      AND UserId = @UserId
      AND IsActive = 1
      AND ExpiryDate > GETDATE()
    ORDER BY CreatedAt DESC;
END