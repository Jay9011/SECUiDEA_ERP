IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RefreshTokens]') AND type IN (N'U'))
    DROP TABLE [dbo].[RefreshTokens]
GO
CREATE TABLE RefreshTokens
(
    Id                  INT IDENTITY (1,1) PRIMARY KEY,
    SessionId           NVARCHAR(100)   NOT NULL,
    Provider            NVARCHAR(100)   NOT NULL,
    UserId              NVARCHAR(100)   NOT NULL,
    Token               NVARCHAR(255)   NOT NULL,
    ExpiryDate          DATETIME        NOT NULL,
    CreatedByIp         NVARCHAR(50)    NOT NULL,
    CreatedAt           DATETIME        NOT NULL DEFAULT GETDATE(),
    IsRevoked           BIT             NOT NULL DEFAULT 0,
    RevokedAt           DATETIME        NULL,
    RevokedByIp         NVARCHAR(50)    NULL,
    ReplacedByToken     NVARCHAR(255)   NULL,
    ReasonRevoked       NVARCHAR(255)   NULL,
    LastActivityDate    DATETIME        NOT NULL,
    CONSTRAINT UK_Token UNIQUE (Token)
);
GO
-- 인덱스 추가
CREATE INDEX IX_RefreshTokens_UserId_Provider ON RefreshTokens(UserId, Provider);
CREATE INDEX IX_RefreshTokens_ExpiryDate ON RefreshTokens(ExpiryDate);
GO
-- SessionId에 대한 외래 키 추가
ALTER TABLE RefreshTokens
ADD CONSTRAINT FK_RefreshTokens_UserSessions FOREIGN KEY (SessionId) 
    REFERENCES UserSessions (SessionId)
ON DELETE CASCADE;