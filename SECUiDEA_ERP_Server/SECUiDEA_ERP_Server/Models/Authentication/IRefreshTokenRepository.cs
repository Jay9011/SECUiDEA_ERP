namespace SECUiDEA_ERP_Server.Models.Authentication;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> GetByTokenAsync(string token);
    Task SaveTokenAsync(RefreshToken token);
    Task UpdateTokenAsync(RefreshToken token);
    Task<List<RefreshToken>> GetActiveTokensByUserIdAsync(string provider, string userId);
}