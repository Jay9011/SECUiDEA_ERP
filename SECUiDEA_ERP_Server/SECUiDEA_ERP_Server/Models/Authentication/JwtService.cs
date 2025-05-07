using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CryptoManager;
using FileIOHelper;
using Microsoft.IdentityModel.Tokens;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Authentication;

public partial class JwtService
{
    public JwtSettings GetSettings => _jwtSettings;
    private readonly JwtSettings _jwtSettings;

    // 암/복호화 할 키 리스트
    private static readonly string[] _cryptKeys = new[]
    {
        StringClass.Secret,
        StringClass.Issuer,
        StringClass.Audience,
    };
    
    #region 의존 주입

    private readonly IIOHelper _registryHelper;
    private readonly ICryptoManager _cryptoManager;

    #endregion

    /// <summary>
    /// JWT 서비스 생성자
    /// Singleton으로 등록된다고 가성하고, 최초 호출시 Registry에서 값을 읽어옴
    /// </summary>
    /// <param name="registryHelper">레지스트리 IIOHelper</param>
    /// <param name="cryptoManager">암호화 ICryptoManager</param>
    public JwtService(
        [FromKeyedServices(StringClass.IoRegistry)] IIOHelper registryHelper, 
        [FromKeyedServices(StringClass.CryptoSecuidea)] ICryptoManager cryptoManager
        )
    {
        #region 의존 주입
        
        _registryHelper = registryHelper;
        _cryptoManager = cryptoManager;

        #endregion

        _jwtSettings = LoadJwtSettings();
    }

    #region Public APIs

    /// <summary>
    /// JWT 토큰 생성
    /// </summary>
    /// <param name="user">User 정보</param>
    /// <param name="sessionId">Session ID</param>
    /// <returns><see cref="string"/> 형식의 JWT 토큰</returns>
    public string GenerateJwtToken(User user, string? sessionId = null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Convert.FromBase64String(_jwtSettings.Secret);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.ID),  // 사용자 ID 정보
            new Claim(ClaimTypes.Name, user.Name),          // 사용자 이름 정보
            new Claim(ClaimTypes.Sid, user.Seq),            // 사용자 시퀀스 정보
            new Claim(ClaimTypes.Role, user.UserRole)       // 사용자 역할 정보
        };

        // 세션 ID 추가
        if (!string.IsNullOrEmpty(sessionId))
        {
            claims.Add(new Claim(StringClass.SessionId, sessionId));
        }

        #region 권한 정보 추가

        // 사용자 권한 추가 (권한 정보는 List 형식으로 가져와야 함)
        // 값은 Feature:PermissionLevel 형식으로 Claim에 추가
        foreach (var permission in user.Permissions)
        {
            claims.Add(new Claim($"{StringClass.Permission}:{permission.Feature}", permission.Level.ToString()));
        }

        #endregion

        // 토큰 생성 및 서명
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),                               // 모든 Claim 정보 추가
            Issuer = _jwtSettings.Issuer,                                       // 토큰 발급자 정보
            Audience = _jwtSettings.Audience,                                   // 토큰 대상자 정보
            Expires = DateTime.Now.AddMinutes(_jwtSettings.ExpiryMinutes),      // 토큰 만료 시간 정보
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),                                  // 토큰 서명 대칭키
                SecurityAlgorithms.HmacSha256Signature                 // 토큰 서명 해시 알고리즘
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// JWT 토큰에서 세션 ID를 추출하는 메서드
    /// </summary>
    /// <param name="token">JWT 토큰</param>
    /// <returns>Session ID</returns>
    public string? ExtractSessionIdFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var sessionIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == StringClass.SessionId);
            if (sessionIdClaim != null)
            {
                return sessionIdClaim.Value;
            }
        }
        catch (Exception e)
        {
            return null;
        }

        return null;
    }

    /// <summary>
    /// JWT 토큰에서 사용자 ID를 추출하는 메서드
    /// </summary>
    /// <param name="token">JWT 토큰</param>
    /// <returns>사용자 ID</returns>
    public string? ExtractUserIdFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                return userIdClaim.Value;
            }
        }
        catch (Exception e)
        {
            return null;
        }
        return null;
    }

    /// <summary>
    /// Refresh Token 생성 메서드
    /// </summary>
    /// <param name="ipAddress"></param>
    /// <returns></returns>
    public RefreshToken GenerateRefreshToken(string userId, string ipAddress, string sessionId, bool rememberMe = false)
    {
        using var rng = RandomNumberGenerator.Create();
        var randomBytes = new byte[64];
        rng.GetBytes(randomBytes);

        var tokenValue = Convert.ToBase64String(randomBytes);

        var expiryDate = rememberMe
            ? DateTime.Now.AddDays(_jwtSettings.AutoLoginDays)
            : DateTime.Now.AddDays(_jwtSettings.RefreshTokenDays);

        return new RefreshToken
        {
            UserId = userId,
            Token = tokenValue,
            ExpiryDate = expiryDate,
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.Now,
            SessionId = sessionId,
            LastActivityDate = DateTime.Now
        };
    }

    /// <summary>
    /// 토큰 유효성 검증
    /// </summary>
    /// <param name="token"></param>
    /// <param name="principal"></param>
    /// <returns></returns>
    public bool ValidateToken(string token, out ClaimsPrincipal principal)
    {
        principal = null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Convert.FromBase64String(_jwtSettings.Secret);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidAudience = _jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            };

            principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            return true;
        }
        catch (Exception e)
        {
            return false;
        }
    }

    #endregion

    #region JWT 설정 관리

    /// <summary>
    /// JWT 설정을 위한 Dictionary 생성
    /// </summary>
    /// <param name="collection">JWT 설정을 담기 위한 Dictionary</param>
    /// <param name="secretKey">JWT 비밀키</param>
    /// <param name="cryptoManager">암호화를 하는 경우 사용할 CryptoManager</param>
    public static void SetJwtCollection(Dictionary<string, string> collection, string secretKey, ICryptoManager? cryptoManager = null)
    {
        collection[StringClass.Secret] = secretKey;
        collection[StringClass.Issuer] = StringClass.SECUiDEA_Issuer;
        collection[StringClass.Audience] = StringClass.SECUiDEA_Audience;
        collection[StringClass.ExpiryMinutes] = StringClass.DefaultExpiryMinutes.ToString();
        collection[StringClass.RefreshTokenDays] = StringClass.DefaultRefreshTokenDays.ToString();
        collection[StringClass.AutoLoginDays] = StringClass.DefaultAutoLoginDays.ToString();
        collection[StringClass.PreventDuplicateLogin] = StringClass.DefaultPreventDuplicateLogin.ToString();
        collection[StringClass.InactivityTimeout] = StringClass.DefaultInactivityTimeout.ToString();
        collection[StringClass.InactivityTimeoutMinutes] = StringClass.DefaultInactivityTimeoutMinutes.ToString();

        if (cryptoManager != null)
        {
            foreach (var key in _cryptKeys)
            {
                if (collection.ContainsKey(key))
                {
                    collection[key] = cryptoManager.Encrypt(collection[key]);
                }
            }
        }
    }

    /// <summary>
    /// JWT 설정을 초기화하는 메서드
    /// </summary>
    /// <param name="regIoHelper"></param>
    /// <param name="cryptoManager"></param>
    /// <exception cref="Exception"></exception>
    public static void JwtConfigSetup(IIOHelper regIoHelper, ICryptoManager cryptoManager)
    {
        try
        {
            // 이미 설정이 있는 경우 바로 종료
            {
                var existingSettings = TryGetJwtCollection(regIoHelper, cryptoManager);
                if (existingSettings.Count > 0
                    && existingSettings.ContainsKey(StringClass.Secret)
                    && existingSettings.TryGetValue(StringClass.Issuer, out string? issuer))
                {
                    if (issuer == StringClass.SECUiDEA_Issuer)
                    {
                        return;
                    }
                }
            }

            var jwtSettings = new Dictionary<string, string>();

            string secret = GenerateSecureKey(64);
            SetJwtCollection(jwtSettings, secret, cryptoManager);
            regIoHelper.WriteSection(StringClass.JwtSettings, jwtSettings);

            // 설정을 저장한 후, 다시 읽어와서 확인
            if (cryptoManager.Decrypt(regIoHelper.ReadValue(StringClass.JwtSettings, StringClass.Secret))
                != secret)
            {

                throw new Exception("Failed to save the secret key.");
            }
        }
        catch (Exception e)
        {
            throw new Exception("Failed to save the secret key.");
        }
    }

    /// <summary>
    /// JWT 설정을 가져오기 위한 메서드
    /// </summary>
    /// <param name="regIoHelper">JWT 파일이 저장된 IIOHelper</param>
    /// <param name="cryptoManager">암호화가 되어있는 경우 복호화를 위한 CryptoManager</param>
    /// <returns><see cref="Dictionary{string, string}"/> JWT 설정을 담고 있는 Dictionary</returns>
    /// <exception cref="FileNotFoundException">JWT 설정 파일이 존재하지 않는 경우</exception>
    public static Dictionary<string, string> GetJwtCollection(IIOHelper regIoHelper, ICryptoManager? cryptoManager = null)
    {
        // 경로에 JWT 설정이 없다면 예외 발생
        if (regIoHelper.IsExists(StringClass.JwtSettingsFullPath) == false)
        {
            throw new FileNotFoundException("JWT 설정 파일이 존재하지 않습니다.");
        }

        return GetJwtDictionary(regIoHelper, cryptoManager);
    }

    /// <summary>
    /// JWT 설정을 가져오기 위한 메서드 (예외 처리 없이 시도)
    /// </summary>
    /// <param name="regIoHelper">JWT 파일이 저장된 IIOHelper</param>
    /// <param name="cryptoManager">암호화가 되어있는 경우 복호화를 위한 CryptoManager</param>
    /// <returns><see cref="Dictionary{string, string}"/> JWT 설정을 담고 있는 Dictionary</returns>
    public static Dictionary<string, string> TryGetJwtCollection(IIOHelper regIoHelper, ICryptoManager? cryptoManager = null)
    {
        // 경로에 JWT 설정이 없다면 빈 Dictionary 반환
        if (!regIoHelper.IsExists(StringClass.JwtSettingsFullPath))
        {
            return new Dictionary<string, string>();
        }

        return GetJwtDictionary(regIoHelper, cryptoManager);
    }

    /// <summary>
    /// JWT 설정을 가져오기 위한 메서드 (설정이 없는 경우 생성)
    /// </summary>
    /// <param name="regIoHelper">JWT 파일이 저장된 IIOHelper</param>
    /// <param name="cryptoManager">암호화가 되어있는 경우 복호화를 위한 CryptoManager</param>
    /// <returns><see cref="Dictionary{string, string}"/> JWT 설정을 담고 있는 Dictionary</returns>
    public static Dictionary<string, string> GetSetJwtCollection(IIOHelper regIoHelper, string secretKey, ICryptoManager? cryptoManager = null)
    {
        // 경로에 파일이 없는 경우 JWT 설정을 생성
        if (!regIoHelper.IsExists(StringClass.JwtSettingsFullPath))
        {
            var jwtSettings = new Dictionary<string, string>();
            SetJwtCollection(jwtSettings, secretKey, cryptoManager);
            regIoHelper.WriteSection(StringClass.JwtSettings, jwtSettings);
        }

        return GetJwtDictionary(regIoHelper, cryptoManager);
    }

    /// <summary>
    /// JWT 설정을 Dictionary로 가져오는 메서드
    /// </summary>
    /// <param name="regIoHelper">JWT 파일이 저장된 IIOHelper</param>
    /// <param name="cryptoManager">암호화가 되어있는 경우 복호화를 위한 CryptoManager</param>
    /// <returns><see cref="Dictionary{string, string}"/> JWT 설정을 담고 있는 Dictionary</returns>
    private static Dictionary<string, string> GetJwtDictionary(IIOHelper regIoHelper, ICryptoManager? cryptoManager = null)
    {
        var jwtSettings = new Dictionary<string, string>();

        var existingSettings = regIoHelper.ReadSection(StringClass.JwtSettings);
        if (existingSettings is { Count: > 0 })
        {
            foreach (var key in existingSettings.Keys)
            {
                jwtSettings[key] = existingSettings[key];
            }
        }

        if (cryptoManager != null)
        {
            foreach (var key in _cryptKeys)
            {
                if (jwtSettings.ContainsKey(key))
                {
                    jwtSettings[key] = cryptoManager.Decrypt(jwtSettings[key]);
                }
            }
        }

        return jwtSettings;
    }

    /// <summary>
    /// JWT 설정을 로드
    /// </summary>
    /// <returns></returns>
    private JwtSettings LoadJwtSettings()
    {
        var values = GetJwtCollection(_registryHelper, _cryptoManager);

        var settings = new JwtSettings
        {
            Secret = values[StringClass.Secret],
            Issuer = values[StringClass.Issuer],
            Audience = values[StringClass.Audience],
        };

        // JWT 만료 시간 설정
        if (double.TryParse(values[StringClass.ExpiryMinutes], out var expiryMinutes))
        {
            settings.ExpiryMinutes = expiryMinutes;
        }

        // Refresh Token 만료 시간 설정
        if (double.TryParse(values[StringClass.RefreshTokenDays], out var refreshTokenDays))
        {
            settings.RefreshTokenDays = refreshTokenDays;
        }

        // 자동 로그인 만료 시간 설정
        if (double.TryParse(values[StringClass.AutoLoginDays], out var autoLoginDays))
        {
            settings.AutoLoginDays = autoLoginDays;
        }

        // 중복 로그인 방지 설정
        if (bool.TryParse(values[StringClass.PreventDuplicateLogin], out var preventDuplicateLogin))
        {
            settings.PreventDuplicateLogin = preventDuplicateLogin;
        }

        // 비활성 타임아웃 설정
        if (bool.TryParse(values[StringClass.InactivityTimeout], out var inactivityTimeout))
        {
            settings.InactivityTimeout = inactivityTimeout;
        }

        // 비활성 타임아웃 시간 설정
        if (double.TryParse(values[StringClass.InactivityTimeoutMinutes], out var inactivityTimeoutMinutes))
        {
            settings.InactivityTimeoutMinutes = inactivityTimeoutMinutes;
        }

        return settings;
    }

    #endregion
    
    /// <summary>
    /// Secure Key를 생성하는 메서드
    /// </summary>
    /// <param name="keySizeInBytes">Secure Key의 바이트 크기</param>
    /// <returns>생성된 Secure Key</returns>
    private static string GenerateSecureKey(int keySizeInBytes = 64)
    {
        var randomBytes = new byte[keySizeInBytes];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        return Convert.ToBase64String(randomBytes);
    }
}