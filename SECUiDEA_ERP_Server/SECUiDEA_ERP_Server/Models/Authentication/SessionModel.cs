using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;

namespace SECUiDEA_ERP_Server.Models.Authentication;

public class UserSession : SQLParam
{
    public int Id { get; set; }
    [DbParameter]
    public string Provider { get; set; }
    [DbParameter]
    public string UserId { get; set; }
    [DbParameter]
    public string SessionId { get; set; }
    [DbParameter]
    public string IpAddress { get; set; }
    [DbParameter]
    public DateTime CreatedAt { get; set; }
    [DbParameter]
    public DateTime LastActivityAt { get; set; }
    [DbParameter]
    public bool IsActive { get; set; }
    [DbParameter]
    public DateTime ExpiryDate { get; set; }
    [DbParameter]
    public DateTime? DeactivatedAt { get; set; }
    [DbParameter]
    public string? DeactivatedReason { get; set; }

    // 추가 파라미터로 인한 속성들
    [DbParameter]
    public string CurrentSessionId { get; set; }
}

public class Providers
{
    public const string S1ACCESS = "S1ACCESS";
    public const string SECUiDEA = "SECUiDEA";
}