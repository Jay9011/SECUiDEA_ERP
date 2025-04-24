USE [SECUiDEA]
GO
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
    
    -- 만료일이 오래된 비활성 세션 삭제
    DELETE FROM UserSessions
    WHERE IsActive = 0
      AND DeactivatedAt < DATEADD(DAY, -1, GETDATE());
    
    -- 만료일이 오래된 비활성 RefreshToken 삭제
	DELETE rt
	FROM RefreshTokens rt
	LEFT JOIN UserSessions us ON rt.SessionId = us.SessionId AND us.IsActive = 1
	WHERE us.SessionId IS NULL
	   OR rt.ExpiryDate < DATEADD(DAY, -1, GETDATE());
END