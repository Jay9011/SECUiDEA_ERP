USE [SECUiDEA]
GO
IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_CleanupExpiredSessions]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_CleanupExpiredSessions]
GO
CREATE PROCEDURE Auth_CleanupExpiredSessions
AS 
BEGIN 
    UPDATE UserSessions
    SET IsActive = 0,
        DeactivatedAt = GETDATE(),
        DeactivatedReason = 'Session expired'
    WHERE IsActive = 1
      AND ExpiryDate < GETDATE();
END