using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Authentication;

public class JwtSettings
{
    public string Secret { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int ExpiryMinutes { get; set; } = StringClass.DefaultExpiryMinutes;
    public int RefreshTokenDays { get; set; } = StringClass.DefaultRefreshTokenDays;
    public int AutoLoginDays { get; set; } = StringClass.DefaultAutoLoginDays;
    public bool PreventDuplicateLogin { get; set; } = StringClass.DefaultPreventDuplicateLogin;      // 중복 로그인 방지 여부
    public bool InactivityTimeout { get; set; } = StringClass.DefaultInactivityTimeout;              // 비활성 타임아웃 여부
    public int InactivityTimeoutMinutes { get; set; } = StringClass.DefaultInactivityTimeoutMinutes; // 비활성 타임아웃 시간 (분 단위)
}

/// <summary>
/// JWT 인증 토큰 재발급용 토큰
/// </summary>
public class RefreshToken
{
    public string SessionId { get; set; } = Guid.NewGuid().ToString();

    public int Id { get; set; }
    public string Provider { get; set; } = Providers.SECUiDEA; // 공급자 (예: S1, SECUiDEA)
    public string UserId { get; set; }
    public string Token { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string CreatedByIp { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string RevokedByIp { get; set; }
    public string ReplacedByToken { get; set; }
    public string ReasonRevoked { get; set; }
    public DateTime LastActivityDate { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
    public bool IsActive => !IsRevoked && !IsExpired;
}

/// <summary>
/// JWT 인증 토큰 응답 모델
/// </summary>
public class TokenResponse
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string SessionId { get; set; }
}