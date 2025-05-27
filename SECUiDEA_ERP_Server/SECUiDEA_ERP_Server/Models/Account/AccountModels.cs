using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;

/// <summary>
/// 기본 계정 모델
/// </summary>
public class AccountModel : SQLParam
{
    [DbParameter]
    public int Seq { get; set; } = 0;
    [DbParameter]
    public string? ID { get; set; }
}

/// <summary>
/// 휴대폰 번호가 있는 계정 모델
/// </summary>
public class AccountMobileModel : AccountModel
{
    [DbParameter]
    public string? Mobile { get; set; }
}

/// <summary>
/// S1 전용 계정 모델
/// </summary>
public class S1AccountModel : SQLParam
{
    [DbParameter]
    public int UID { get; set; } = 0;
    [DbParameter]
    public string? Role { get; set; }
    [DbParameter]
    public string? ID { get; set; }
    [DbParameter]
    public string? Password { get; set; }
    [DbParameter]
    public string? UpdateIP { get; set; }
}

public class S1AccountPassRegParam : S1AccountModel
{
    [DbParameter]
    public string Type { get; set; } = "find";
}

/// <summary>
/// 로그인한 사용자의 비밀번호 변경을 위한 모델
/// </summary>
public class S1UpdatePasswordModel
{
    public string? Password { get; set; }
    public string? CurrentPassword { get; set; }
}