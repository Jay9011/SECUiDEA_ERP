-- 알리고 템플릿 관리 테이블
IF exists(SELECT * FROM sys.objects WHERE name = 'ALIGO_TPLMANAGE' AND type = 'U')
BEGIN 
    DROP TABLE [dbo].[ALIGO_TPLMANAGE]
END
GO

CREATE TABLE [dbo].[ALIGO_TPLMANAGE]
(
    [UID]         [int] IDENTITY (1,1) NOT NULL,
    [Gubun]       [nvarchar](100)      NULL,
    [ChannelName] [nvarchar](100)      NULL,
    [SenderKey]   [nvarchar](100)      NULL,
    [TPL_CODE]    [nvarchar](100)      NULL,
    [TPL_INTRO]   [nvarchar](MAX)      NULL,
    [Path]        [nvarchar](100)      NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]