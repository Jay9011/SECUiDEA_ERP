IF EXISTS(SELECT * FROM sys.objects WHERE type = 'U' AND name = 'RoleSessionSettings')
BEGIN 
    DROP TABLE RoleSessionSettings;
END
GO
;
CREATE TABLE RoleSessionSettings (
    Id                   INT IDENTITY (1, 1) PRIMARY KEY,
    RoleName             NVARCHAR(50) NOT NULL,
    EnableSessionTimeout BIT          NOT NULL DEFAULT 0,
    SessionTimeoutMinutes INT          NULL,
    CONSTRAINT UK_RoleName UNIQUE (RoleName)
);