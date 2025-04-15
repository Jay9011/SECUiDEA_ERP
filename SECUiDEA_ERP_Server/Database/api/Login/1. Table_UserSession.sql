USE [SECUiDEA]
GO
IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSessions]') AND type IN (N'U'))
    DROP TABLE [dbo].[UserSessions]
GO
CREATE TABLE UserSessions
(
    Id                INT IDENTITY (1,1) PRIMARY KEY,
    Provider          NVARCHAR(100) NOT NULL,
    UserId            NVARCHAR(100) NOT NULL,
    SessionId         NVARCHAR(100) NOT NULL,
    IpAddress         NVARCHAR(50)  NOT NULL,
    CreatedAt         DATETIME      NOT NULL DEFAULT GETDATE(),
    LastActivityAt    DATETIME      NOT NULL,
    IsActive          BIT           NOT NULL DEFAULT 1,
    ExpiryDate        DATETIME      NOT NULL,
    DeactivatedAt     DATETIME      NULL,
    DeactivatedReason NVARCHAR(255) NULL,
    CONSTRAINT UK_SessionId UNIQUE (SessionId),
);