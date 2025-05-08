IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_GetActiveSessions]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_GetActiveSessions]
GO
CREATE PROCEDURE Auth_GetActiveSessions
AS
BEGIN
    SELECT 
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
    WHERE IsActive = 1
      AND ExpiryDate > GETDATE();
END