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
    
    DECLARE @Role NVARCHAR(50) = 'Fail';
    DECLARE @EnableSessionTimeout BIT = 0;
    DECLARE @SessionTimeoutMinutes INT;
    
    -- 협력 업체 확인
    IF exists(SELECT TOP(1) * FROM Person WHERE Sabun = @ID AND PersonTypeID = 2)
    BEGIN 
        SET @Role = 'Cooperation';
        -- 해당 Role에 대한 Session Timeout 설정이 존재한다면 Timeout 설정
        IF EXISTS(SELECT TOP (1) * FROM RoleSessionSettings WHERE RoleName = @Role)
        BEGIN 
            SELECT @EnableSessionTimeout = EnableSessionTimeout,
                   @SessionTimeoutMinutes = SessionTimeoutMinutes
            FROM RoleSessionSettings
            WHERE RoleName = @Role
        END
        
        SELECT @Role AS AuthType,
               PID AS Seq,
               Sabun AS ID,
               Password AS Password,
               Name AS Name,
               PersonStatusID AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW,
               @EnableSessionTimeout AS EnableSessionTimeout,
               @SessionTimeoutMinutes AS SessionTimeoutMinutes
        FROM Person
        WHERE Sabun = @ID
    END
    -- 직원 확인
    ELSE IF exists(SELECT TOP(1) * FROM Person WHERE Sabun = @ID AND PersonTypeID in (0, 1))
    BEGIN 
        SET @Role = 'Employee';
        -- 해당 Role에 대한 Session Timeout 설정이 존재한다면 Timeout 설정
        IF EXISTS(SELECT TOP (1) * FROM RoleSessionSettings WHERE RoleName = @Role)
        BEGIN 
            SELECT @EnableSessionTimeout = EnableSessionTimeout,
                   @SessionTimeoutMinutes = SessionTimeoutMinutes
            FROM RoleSessionSettings
            WHERE RoleName = @Role
        END
        
        SELECT @Role AS AuthType,
               PID AS Seq,
               Sabun AS ID,
               Password AS Password,
               Name AS Name,
               PersonStatusID AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW,
               @EnableSessionTimeout AS EnableSessionTimeout,
               @SessionTimeoutMinutes AS SessionTimeoutMinutes
        FROM Person
        WHERE Sabun = @ID
    END
    -- 관리자 확인
    ELSE IF exists(SELECT TOP (1) * FROM EqUser WHERE ID = @ID)
    BEGIN 
        SET @Role = 'Admin';
        -- 해당 Role에 대한 Session Timeout 설정이 존재한다면 Timeout 설정
        IF EXISTS(SELECT TOP (1) * FROM RoleSessionSettings WHERE RoleName = @Role)
        BEGIN 
            SELECT @EnableSessionTimeout = EnableSessionTimeout,
                   @SessionTimeoutMinutes = SessionTimeoutMinutes
            FROM RoleSessionSettings
            WHERE RoleName = @Role
        END
        
        SELECT @Role AS AuthType,
               EqUserID AS Seq,
               ID AS ID,
               Password AS Password,
               EqUserName AS Name,
               CASE DeleteFlag WHEN 0   THEN 0
                                        ELSE 2
                END AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW,
               @EnableSessionTimeout AS EnableSessionTimeout,
               @SessionTimeoutMinutes AS SessionTimeoutMinutes
        FROM EqUser
        WHERE ID = @ID
    END
    -- 로그인 실패
    ELSE
    BEGIN 
        SELECT @Role AS AuthType,
               NULL AS Seq,
               NULL AS ID,
               NULL AS Password,
               NULL AS Name,
               NULL AS PersonStatusID,
               (SELECT VisitSabunPW FROM SystemSetup) AS VisitSabunPW,
               @EnableSessionTimeout AS EnableSessionTimeout,
               @SessionTimeoutMinutes AS SessionTimeoutMinutes
    END
END