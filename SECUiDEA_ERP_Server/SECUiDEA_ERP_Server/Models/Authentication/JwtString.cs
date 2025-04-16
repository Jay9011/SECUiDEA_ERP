namespace SECUiDEA_ERP_Server.Models.Authentication;

public class JwtProcedure
{
    public const string GetRefreshTokenByToken = "Auth_GetRefreshTokenByToken";
    public const string GetActiveTokensByUserId = "Auth_GetActiveTokensByUserId";

    public const string SaveRefreshToken = "Auth_SaveRefreshToken";
    
    public const string UpdateRefreshToken = "Auth_UpdateRefreshToken";
}