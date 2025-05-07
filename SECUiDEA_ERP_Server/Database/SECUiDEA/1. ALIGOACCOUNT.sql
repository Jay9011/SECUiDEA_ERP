-- 알리고 계정 관리 테이블
IF exists(SELECT * FROM sys.objects WHERE name = 'ALIGO_ACCOUNT' AND type = 'U')
BEGIN 
    DROP TABLE [dbo].[ALIGO_ACCOUNT]
END
GO

CREATE TABLE [dbo].[ALIGO_ACCOUNT]
(
    [APIKey]      [varchar](MAX)  NULL,
    [UserID]      [varchar](50)   NULL,
    [SenderPhone] [varchar](50)   NULL,
    [SenderName]  [varchar](50)   NULL,
    [Url]         [nvarchar](MAX) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]