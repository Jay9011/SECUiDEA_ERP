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
    
    -- 만료일이 오래된 비활성 세션 삭제
    DELETE FROM UserSessions
    WHERE IsActive = 0
      AND DeactivatedAt < DATEADD(DAY, -1, GETDATE());
    
    -- 만료일이 오래된 비활성 RefreshToken 삭제
	DELETE rt
	FROM RefreshTokens rt
	LEFT JOIN UserSessions us ON rt.SessionId = us.SessionId AND us.IsActive = 1
	WHERE us.SessionId IS NULL
	   OR rt.LastActivityDate < DATEADD(DAY, -1, GETDATE());
END