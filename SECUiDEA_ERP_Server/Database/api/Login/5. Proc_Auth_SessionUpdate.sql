USE [SECUiDEA]
GO
IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Auth_SessionUpdate]') AND type IN (N'P', N'PC'))
    DROP PROCEDURE [dbo].[Auth_SessionUpdate]
GO
CREATE PROCEDURE Auth_SessionUpdate
    @SessionId         NVARCHAR(100)    = NULL,
    @LastActivityAt    DATETIME         = NULL,
    @IsActive          BIT              = NULL,
    @DeactivatedAt     DATETIME         = NULL,
    @DeactivatedReason NVARCHAR(255)    = NULL
AS 
BEGIN 
    UPDATE UserSessions 
    SET 
        LastActivityAt    = @LastActivityAt,
        IsActive          = @IsActive,
        DeactivatedAt     = CASE    WHEN @IsActive = 0 THEN @DeactivatedAt 
                                    ELSE DeactivatedAt 
                            END,
        DeactivatedReason = CASE    WHEN @IsActive = 0 THEN @DeactivatedReason 
                                    ELSE DeactivatedReason 
                            END
    WHERE SessionId = @SessionId;
END