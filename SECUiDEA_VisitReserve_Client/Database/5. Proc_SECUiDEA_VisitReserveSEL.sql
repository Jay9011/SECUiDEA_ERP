IF EXISTS(SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SECUiDEA_VisitReserveSEL]') AND type in (N'P', N'PC'))
    DROP PROCEDURE SECUiDEA_VisitReserveSEL
GO
CREATE PROCEDURE SECUiDEA_VisitReserveSEL
    @Type               NVARCHAR(50)    = 'visitPurpose'
AS 
BEGIN 
    SET NOCOUNT ON;
END