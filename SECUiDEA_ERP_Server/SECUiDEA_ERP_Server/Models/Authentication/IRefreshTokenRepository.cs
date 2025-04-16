namespace SECUiDEA_ERP_Server.Models.Authentication;

public interface IRefreshTokenRepository
{
    /// <summary>
    /// 토큰으로 RefreshToken 조회
    /// </summary>
    /// <param name="token">RefreshToken</param>
    /// <returns></returns>
    Task<RefreshToken> GetByTokenAsync(string token);

    /// <summary>
    /// 새로운 RefreshToken 저장
    /// </summary>
    /// <param name="token"></param>
    /// <returns></returns>
    Task SaveTokenAsync(RefreshToken token);

    /// <summary>
    /// 기존 RefreshToken 업데이트 (토큰 취소, 토큰 교체, 로그아웃 등)
    /// </summary>
    /// <param name="token"></param>
    /// <returns></returns>
    Task UpdateTokenAsync(RefreshToken token);

    /// <summary>
    /// 사용자의 모든 RefreshToken 조회
    /// </summary>
    /// <param name="provider"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    Task<List<RefreshToken>> GetActiveTokensByUserIdAsync(string provider, string userId);
}