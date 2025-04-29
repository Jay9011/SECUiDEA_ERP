IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_VisitReserveListSEL]') AND type in (N'P', N'PC'))
    DROP PROCEDURE SECUiDEA_VisitReserveListSEL
GO
CREATE PROCEDURE SECUiDEA_VisitReserveListSEL
    @Page               INT             = 1
,   @PageSize           INT             = 10
--- 리스트 조회 이용자 관련
,   @RoleType           NVARCHAR(50)    = NULL
,   @UserID             NVARCHAR(50)    = NULL
,   @PID                INT             = NULL
,   @VisitantID         INT             = NULL
--- 필터 관련
,   @StatusFilter       NVARCHAR(20)    = 'all'
,   @StartDate          DATE            = NULL
,   @EndDate            DATE            = NULL
--- 언어 관련
,   @Lan                NVARCHAR(10)    = 'ko'
AS
BEGIN 
    SET NOCOUNT ON;
    
    -- 소문자 변환
    SET @RoleType = LOWER(@RoleType);
    SET @StatusFilter = LOWER(@StatusFilter);
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;  -- 페이지네이션을 위한 Offset 계산

    -- RoleType이 Employee일 경우
    IF (@RoleType = 'employee')
    BEGIN 
        IF (@StatusFilter = 'all')
        BEGIN 
            SELECT  vrv.VisitReserveVisitantID AS Id
                ,   CASE    WHEN vrv.VisitStatusID = 0 AND vr.VisitAssign = 0 THEN 'pending'
                            WHEN vrv.VisitStatusID = 0 AND vr.VisitAssign = 1 THEN 'approved'
                            WHEN vrv.VisitStatusID = 1 THEN 'visited'
                            WHEN vrv.VisitStatusID = 2 THEN 'finished'
                            WHEN vrv.VisitStatusID = 3 THEN 'finished'
                            WHEN vrv.VisitStatusID = 4 AND vr.VisitAssign = 0 THEN 'canceled' 
                            WHEN vrv.VisitStatusID = 4 AND vr.VisitAssign = 1 THEN 'rejected'
                            ELSE 'unknown'
                    END AS Status
                ,   v.VisitantName AS VisitorName
                ,   v.VisitantCompany AS VisitorCompany
                ,   v.Mobile AS VisitorContact
                ,   v.Email AS VisitorEmail
                ,   vr.VisitSDate AS VisitStartDate
                ,   vr.VisitEDate AS VisitEndDate
                ,   vrl.VisitReasonName AS VisitReason
                ,   vr.VisitReasonText AS VisitPurpose
                ,   p.Name AS PersonName
                ,   vrv.LicensePlateNumber AS LicensePlateNumber         
                ,   vrv.InsertDate AS RegisteredDate
                ,   (CASE
                            WHEN v.EducationDate IS NULL THEN 0
                            WHEN DATEDIFF(MONTH, v.EducationDate, GETDATE()) > 3 THEN 0
                            ELSE 1
                        END
                    ) AS Education
                ,   v.EducationDate AS EducationDate
            FROM    VisitReserveVisitant vrv
            JOIN    VisitReserve vr ON vr.VisitID = vrv.VisitID
            JOIN    Visitant v ON v.VisitantID = vrv.VisitantID
            JOIN    (SELECT VisitReasonID
                          , CASE @Lan   WHEN 'ko' THEN l.Update_KOR
                                        WHEN 'en' THEN l.Update_ENG
                            ELSE l.Update_KOR END AS VisitReasonName FROM VisitReason vr2 LEFT JOIN Localization l ON vr2.VisitReasonNameID = l.RecordID) AS vrl
                    ON vrl.VisitReasonID = vr.VisitReasonID
            JOIN    Person p ON p.PID = vr.PID
            WHERE   vr.PID = @PID
            ORDER BY vrv.VisitReserveVisitantID DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;
        END
    END
    -- RoleType이 Guest일 경우
    ELSE IF (@RoleType = 'guest')
    BEGIN 
        IF (@StatusFilter = 'all')
        BEGIN 
            SELECT  vrv.VisitReserveVisitantID AS Id
                ,   CASE    WHEN vrv.VisitStatusID = 0 AND vr.VisitAssign = 0 THEN 'pending'
                            WHEN vrv.VisitStatusID = 0 AND vr.VisitAssign = 1 THEN 'approved'
                            WHEN vrv.VisitStatusID = 1 THEN 'visited'
                            WHEN vrv.VisitStatusID = 2 THEN 'finished'
                            WHEN vrv.VisitStatusID = 3 THEN 'finished'
                            WHEN vrv.VisitStatusID = 4 AND vr.VisitAssign = 0 THEN 'canceled' 
                            WHEN vrv.VisitStatusID = 4 AND vr.VisitAssign = 1 THEN 'rejected'
                            ELSE 'unknown'
                    END AS Status
                ,   v.VisitantName AS VisitorName
                ,   v.VisitantCompany AS VisitorCompany
                ,   v.Mobile AS VisitorContact
                ,   v.Email AS VisitorEmail
                ,   vr.VisitSDate AS VisitStartDate
                ,   vr.VisitEDate AS VisitEndDate
                ,   vrl.VisitReasonName AS VisitReason
                ,   vr.VisitReasonText AS VisitPurpose
                ,   p.Name AS PersonName
                ,   vrv.LicensePlateNumber AS LicensePlateNumber         
                ,   vrv.InsertDate AS RegisteredDate
                ,   (CASE
                            WHEN v.EducationDate IS NULL THEN 0
                            WHEN DATEDIFF(MONTH, v.EducationDate, GETDATE()) > 3 THEN 0
                            ELSE 1
                        END
                    ) AS Education
                ,   v.EducationDate AS EducationDate
            FROM    VisitReserveVisitant vrv
            JOIN    VisitReserve vr ON vr.VisitID = vrv.VisitID
            JOIN    Visitant v ON v.VisitantID = vrv.VisitantID
            JOIN    (SELECT VisitReasonID
                          , CASE @Lan   WHEN 'ko' THEN l.Update_KOR
                                        WHEN 'en' THEN l.Update_ENG
                            ELSE l.Update_KOR END AS VisitReasonName FROM VisitReason vr2 LEFT JOIN Localization l ON vr2.VisitReasonNameID = l.RecordID) AS vrl
                    ON vrl.VisitReasonID = vr.VisitReasonID
            JOIN    Person p ON p.PID = vr.PID
            WHERE   v.VisitantID = @VisitantID
            ORDER BY vrv.VisitReserveVisitantID DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;
        END
    END
END
GO 