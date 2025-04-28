IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_VisitReasonSEL]') AND type in (N'P', N'PC'))
    DROP PROCEDURE SECUiDEA_VisitReasonSEL
GO
CREATE PROCEDURE SECUiDEA_VisitReasonSEL
    @Lan    NVARCHAR(10) = 'ko'
AS
BEGIN 
    SET NOCOUNT ON;
    
    SELECT 
        VisitReasonID,
        CASE @Lan
            WHEN 'ko' THEN l.Update_KOR
            WHEN 'en' THEN l.Update_ENG
            ELSE l.Update_KOR
        END AS VisitReasonName  
    FROM VisitReason v
    JOIN Localization l ON v.VisitReasonNameID = l.RecordID
    ;
END