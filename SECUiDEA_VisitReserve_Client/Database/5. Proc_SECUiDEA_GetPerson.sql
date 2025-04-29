IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_GetPerson]') AND type in (N'P', N'PC'))
	DROP PROCEDURE SECUiDEA_GetPerson
GO
CREATE PROCEDURE SECUiDEA_GetPerson
    @Type       NVARCHAR(10)    = 'name',
    @Name       NVARCHAR(50)
AS
    SET NOCOUNT ON;
    
	SET @Type = LOWER(@Type)

    IF (@Type = 'name')
    BEGIN
        SELECT  PID, Sabun, Name,
                O.OrgName AS DepartmentName,
                PersonStatusID,
                CASE PersonStatusID
                    WHEN 0 THEN 'Active'
                    WHEN 1 THEN 'Leave'
                    WHEN 2 THEN 'Resign'
                    ELSE 'Unknown'
                END AS PersonStatusName
        FROM    Person AS P 
        JOIN    Org AS O ON P.OrgID = O.OrgID
        WHERE   Name = @Name
          AND   PersonStatusID = 0
    END
GO