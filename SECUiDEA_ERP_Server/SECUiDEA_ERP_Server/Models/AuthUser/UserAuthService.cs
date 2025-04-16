using CoreDAL.Configuration.Interface;
using SECUiDEA_ERP_Server.Models.Authentication;

namespace SECUiDEA_ERP_Server.Models.AuthUser;

public class UserAuthService
{
    #region 의존 주입
    
    private readonly JwtService _jwtService;
    private readonly SessionService _sessionService;
    private readonly IRefreshTokenRepository _tokenRepository;
    private readonly UserRepositoryFactory _userRepositoryFactory;

    #endregion

    public UserAuthService(JwtService jwtService, SessionService sessionService, IRefreshTokenRepository tokenRepository, UserRepositoryFactory userRepositoryFactory)
    {

        #region 의존 주입
        
        _jwtService = jwtService;
        _sessionService = sessionService;
        _tokenRepository = tokenRepository;
        _userRepositoryFactory = userRepositoryFactory;

        #endregion
    }

    /// <summary>
    /// 인증 성공 후 토큰 발급 및 세션 생성
    /// </summary>
    /// <param name="provider"></param>
    /// <param name="user"></param>
    /// <param name="ipAddress"></param>
    /// <param name="rememberMe"></param>
    /// <returns></returns>
    public async Task<TokenResponse> CompleteLoginAsync(string provider, User user, string ipAddress, bool rememberMe = false)
    {
        // 세션 생성
        string sessionId = await _sessionService.CreateSessionAsync(provider, user.ID, ipAddress, rememberMe);

        // JWT 토큰 생성
        string accessToken = _jwtService.GenerateJwtToken(user, sessionId);

        // Refresh 토큰 생성
        RefreshToken refreshToken = _jwtService.GenerateRefreshToken(user.ID, ipAddress, sessionId, rememberMe);
        refreshToken.Provider = provider;

        await _tokenRepository.SaveTokenAsync(refreshToken);

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiryDate = DateTime.UtcNow.AddMinutes(_jwtService.GetSettings.ExpiryMinutes),
            SessionId = sessionId
        };
    }

    /// <summary>
    /// Refresh Token을 사용하여 새로운 Access Token 발급
    /// </summary>
    /// <param name="refreshToken"></param>
    /// <param name="ipAddress"></param>
    /// <returns></returns>
    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        // RefreshToken 조회
        var token = await _tokenRepository.GetByTokenAsync(refreshToken);
        if (token == null || !token.IsActive)
        {
            return null;
        }

        // 세션 유효성 확인
        bool isValidSession = await _sessionService.ValidateSessionAsync(token.UserId, token.Provider, token.SessionId);

        if (!isValidSession)
        {
            await RevokeTokenAsync(refreshToken, ipAddress, "Session is no longer valid");
            return null;
        }

        // 사용자 정보 조회
        var user = await GetUserByIdAsync(token.Provider, token.UserId);
        if (user == null)
        {
            return null;
        }

        // 새로운 JWT 토큰 생성
        string newAccessToken = _jwtService.GenerateJwtToken(user, token.SessionId);

        // 세션 활동 시간 업데이트
        await _sessionService.UpdateSessionActivityAsync(token.Provider, token.UserId, token.SessionId);

        return new TokenResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = token.Token,
            ExpiryDate = DateTime.UtcNow.AddMinutes(_jwtService.GetSettings.ExpiryMinutes),
            SessionId = token.SessionId
        };
    }

    /// <summary>
    /// 로그아웃 처리
    /// </summary>
    /// <param name="accessToken"></param>
    /// <param name="refreshToken"></param>
    /// <param name="ipAddress"></param>
    /// <returns></returns>
    public async Task LogoutAsync(string accessToken, string refreshToken, string ipAddress)
    {
        // Access Token에서 세션 ID 추출
        var sessionId = _jwtService.ExtractSessionIdFromToken(accessToken);
        
        if (!string.IsNullOrEmpty(sessionId))
        {
            await _sessionService.DeactivateSessionAsync(sessionId);
        }
        
        await RevokeTokenAsync(refreshToken, ipAddress, "User Logout");
    }

    /// <summary>
    /// Refresh Token 취소
    /// </summary>
    /// <param name="token"></param>
    /// <param name="ipAddress"></param>
    /// <param name="reason"></param>
    /// <returns></returns>
    private async Task RevokeTokenAsync(string token, string ipAddress, string reason)
    {
        var refreshToken = await _tokenRepository.GetByTokenAsync(token);

        if (refreshToken == null)
            return;

        if (!refreshToken.IsActive)
            return;

        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        refreshToken.ReasonRevoked = reason;

        await _tokenRepository.UpdateTokenAsync(refreshToken);
    }

    private async Task<User> GetUserByIdAsync(string provider, string userId)
    {
        var repository = _userRepositoryFactory.GetRepository(provider);
        return await repository.GetUserModelByIdAsync(userId);
    }
}