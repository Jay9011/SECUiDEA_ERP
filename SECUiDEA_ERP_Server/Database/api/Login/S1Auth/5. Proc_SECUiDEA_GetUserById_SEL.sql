IF exists(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_GetUserById_SEL]') AND type IN (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].SECUiDEA_GetUserById_SEL
END
GO
CREATE PROCEDURE [dbo].SECUiDEA_GetUserById_SEL
    @ID         NVARCHAR(50)
AS 
BEGIN 
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
    
    -- 협력 업체 확인
    IF exists(SELECT TOP(1) * FROM Person WHERE Sabun = @ID AND PersonTypeID = 2)
    BEGIN 
        SELECT 'Cooperation' AS AuthType,
               PID AS Seq,
               Sabun AS ID,
               Password AS Password,
               Name AS Name,
               PersonStatusID AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW
        FROM Person
        WHERE Sabun = @ID
    END
    -- 직원 확인
    ELSE IF exists(SELECT TOP(1) * FROM Person WHERE Sabun = @ID AND PersonTypeID in (0, 1))
    BEGIN 
        SELECT 'Employee' AS AuthType,
               PID AS Seq,
               Sabun AS ID,
               Password AS Password,
               Name AS Name,
               PersonStatusID AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW
        FROM Person
        WHERE Sabun = @ID
    END
    -- 관리자 확인
    ELSE IF exists(SELECT TOP (1) * FROM EqUser WHERE ID = @ID)
    BEGIN 
        SELECT 'Admin' AS AuthType,
               EqUserID AS Seq,
               ID AS ID,
               Password AS Password,
               EqUserName AS Name,
               CASE DeleteFlag WHEN 0   THEN 0
                                        ELSE 2
                END AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW
        FROM EqUser
        WHERE ID = @ID
    END
    -- 로그인 실패
    ELSE
    BEGIN 
        SELECT 'Fail' AS AuthType,
               NULL AS Seq,
               NULL AS ID,
               NULL AS Password,
               NULL AS Name,
               NULL AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW
    END
END