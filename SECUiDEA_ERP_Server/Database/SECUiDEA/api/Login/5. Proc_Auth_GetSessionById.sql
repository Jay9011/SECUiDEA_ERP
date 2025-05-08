IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_GetSessionById]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_GetSessionById]
GO
CREATE PROCEDURE Auth_GetSessionById
    @SessionId NVARCHAR(100) = NULL
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
    WHERE SessionId = @SessionId;
END