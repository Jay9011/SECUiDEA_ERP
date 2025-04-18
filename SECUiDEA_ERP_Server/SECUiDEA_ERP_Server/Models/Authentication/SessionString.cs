namespace SECUiDEA_ERP_Server.Models.Authentication;

public class SessionProcedure
{
    public const string GetById = "Auth_GetSessionById";
    public const string GetActives = "Auth_GetActiveSessions";
    public const string GetLatest = "Auth_GetLatestSession";

    public const string Insert = "Auth_SessionInsert";
    public const string Update = "Auth_SessionUpdate";

    public const string DeactivateOthers = "Auth_DeactivateOtherSessions";

    public const string CleanupExpired = "Auth_CleanupExpiredSessions";
}