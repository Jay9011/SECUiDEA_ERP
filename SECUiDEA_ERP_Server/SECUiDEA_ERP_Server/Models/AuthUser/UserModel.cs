namespace SECUiDEA_ERP_Server.Models.AuthUser;

/// <summary>
/// 사용자 권한 레벨
/// </summary>
public class Permission
{
    public string Feature { get; set; }
    public PermissionLevel Level { get; set; }
}

/// <summary>
/// 사용자 정보
/// </summary>
public class User
{
    public string ID { get; set; }
    public string UserRole { get; set; }
    public List<Permission> Permissions { get; set; } = new List<Permission>();
}