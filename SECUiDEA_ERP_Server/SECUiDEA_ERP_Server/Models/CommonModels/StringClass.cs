namespace SECUiDEA_ERP_Server.Models.CommonModels;

public static class StringClass
{
    // 경로 관련
    public const string SECUiDEARegistry = "SoftWare\\SECUiDEA";
    public const string SECUiDEACrypt = "SoftWare\\SECUiDEA\\Crypt";

    public static readonly string SECUiDEAJWT = Path.Combine(SECUiDEARegistry, "JWT");

    // 헤더 관련
    public const string HXRefreshToken = "X-Refresh-Token";

    // 인증 관련
    public const string Permission = "Permission";
    public const string JwtSettings = "JwtSettings";
    public const string RefreshToken = "refreshToken";
    public const string SessionId = "SessionId";
    public const string Secret = "Secret";
    public const string Issuer = "Issuer";
    public const string Audience = "Audience";
    public const string ExpiryMinutes = "ExpiryMinutes";
    public const string ExpiryHours = "ExpiryHours";
    public const string RefreshTokenDays = "RefreshTokenDays";
    public const string AutoLoginDays = "AutoLoginDays";
    public const string PreventDuplicateLogin = "PreventDuplicateLogin";
    public const string InactivityTimeout = "InactivityTimeout";
    public const string InactivityTimeoutMinutes = "InactivityTimeoutMinutes";

    public static readonly string JwtSettingsFullPath = Path.Combine(SECUiDEAJWT, JwtSettings);

    public const string SECUiDEA_Issuer = "SECUiDEA.API";
    public const string SECUiDEA_Audience = "SECUiDEA.Client";
    public const double DefaultExpiryMinutes = 15;             // 기본 JWT 유효기간 (분 단위)
    public const double DefaultExpiryHours = 1;                // 기본 JWT 유효기간 (시간 단위)
    public const double DefaultRefreshTokenDays = 7;           // 기본 Refresh Token 유효기간 (일 단위)
    public const double DefaultAutoLoginDays = 30;             // 기본 자동 로그인 유효기간 (일 단위)
    public const bool DefaultPreventDuplicateLogin = false; // 기본 중복 로그인 방지 여부
    public const bool DefaultInactivityTimeout = false;     // 기본 비활성 시간 초과 여부
    public const double DefaultInactivityTimeoutMinutes = 30;  // 기본 비활성 시간 초과 (분 단위)

    // 설정 파일 관련
    public const string IoDbSetupFile = "dbSetupFile";
    public const string IoRegistry = "registry";
    public const string S1Access = "S1ACCESS";
    public const string SECUIDEA = "SECUiDEA";
    public const string JwtSetupDb = SECUIDEA;
    
    // 암호화 관련
    public const string CryptoAes = "AES";
    public const string CryptoS1Aes = "S1AES";
    public const string CryptoS1Sha512 = "S1SHA512";
    public const string CryptoSecuidea = "SECUiDEAAes";

    // API 키 관련
    public const double DefaultApiExpiryMinutes = 1; // 기본 JWT 유효기간 (분 단위)

    // 카카오 알림톡 관련
    public const string Issuer_Kakao = "Kakao";
}