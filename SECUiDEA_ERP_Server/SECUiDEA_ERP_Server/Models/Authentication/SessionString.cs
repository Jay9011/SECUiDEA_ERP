namespace SECUiDEA_ERP_Server.Models.Authentication;

public class SessionProcedure
{
    public const string GetById = "Auth_GetSessionById";
    public const string GetActives = "Auth_GetActiveSessions";
    public const string GetLatest = "Auth_GetLatestSession";

    public const string Insert = "Auth_SaveSession";
    public const string Update = "Auth_UpdateSession";

    public const string DeactivateOthers = "Auth_DeactivateOtherSessions";

    public const string CleanupExpired = "Auth_CleanupExpiredSessions";
}