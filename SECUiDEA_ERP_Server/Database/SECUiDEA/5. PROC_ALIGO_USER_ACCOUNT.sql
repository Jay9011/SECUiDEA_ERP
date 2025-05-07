IF EXISTS (SELECT name FROM sys.objects WHERE name = 'SECUiDEA_AligoAccount')
BEGIN
	DROP PROCEDURE SECUiDEA_AligoAccount
END
GO
CREATE PROCEDURE SECUiDEA_AligoAccount
    @Type		NVARCHAR(50) = NULL
,   @GUBUN		NVARCHAR(50) = NULL
AS 
BEGIN 
-------------------------------------------------------------------------------------------------
    DECLARE @Result INT = 0;

    BEGIN TRY
		IF(@Type IN ('A')) -- 알리고 계정 정보 가져오기
		BEGIN
			SELECT * FROM ALIGO_ACCOUNT 
		    
		    SET @Result = 1
		    RETURN @Result
		END ELSE
		IF(@Type ='T') -- 템플릿 정보 가져오기
		BEGIN
		 IF EXISTS (SELECT * FROM ALIGO_TPLMANAGE WHERE Gubun = @Gubun)
		 BEGIN
			SELECT * FROM ALIGO_TPLMANAGE WHERE Gubun = @Gubun
		     
            SET @Result = 1
            RETURN @Result
         END
		 ELSE
		    SELECT '템블릿 정보가 없습니다.' AS MESSAGE, 0 AS RESULT
		 END
    END TRY
    BEGIN CATCH
		SELECT ERROR_MESSAGE() AS MESSAGE, 0 AS RESULT
    END CATCH
    
    RETURN @Result
END
GO
