IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_DeactivateOtherSessions]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_DeactivateOtherSessions]
GO
CREATE PROCEDURE Auth_DeactivateOtherSessions
    @Provider           NVARCHAR(100) = NULL,
    @UserId             NVARCHAR(100) = NULL,
    @CurrentSessionId   NVARCHAR(100) = NULL,
    @DeactivatedAt      DATETIME      = NULL,
    @DeactivatedReason  NVARCHAR(255) = NULL
AS
BEGIN 
    UPDATE UserSessions
    SET IsActive = 0,
        DeactivatedAt = @DeactivatedAt,
        DeactivatedReason = @DeactivatedReason
    WHERE Provider = @Provider
      AND UserId = @UserId
      AND SessionId <> @CurrentSessionId
      AND IsActive = 1;
END