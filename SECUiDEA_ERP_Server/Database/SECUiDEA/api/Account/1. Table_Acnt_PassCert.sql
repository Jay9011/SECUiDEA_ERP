IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PassCert]') AND type IN (N'U'))
    DROP TABLE [dbo].[PassCert]
GO
CREATE TABLE [dbo].[PassCert]
(
    [Mobile]            NVARCHAR(50)    NOT NULL,
    [CertificateData]   NVARCHAR(50)    NOT NULL,
    [IssuedDate]        DATETIME        NOT NULL DEFAULT (GETDATE()),
    [CreatedDate]       DATETIME        NOT NULL DEFAULT (GETDATE()),
    [ExpiredDate]       DATETIME        NOT NULL DEFAULT (GETDATE()),
    [UpdateIP]          NVARCHAR(50)    NULL
)
GO
-- Mobile로 Index 생성
CREATE NONCLUSTERED INDEX [IX_PassCert_Mobile] ON [dbo].[PassCert] ([Mobile] ASC)