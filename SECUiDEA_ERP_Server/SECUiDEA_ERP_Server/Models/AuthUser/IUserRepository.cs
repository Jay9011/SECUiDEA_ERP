namespace SECUiDEA_ERP_Server.Models.AuthUser;

public interface IUserRepository
{
    /// <summary>
    /// 식별자 정보
    /// </summary>
    public string ProviderName { get; }

    /// <summary>
    /// 사용자 ID로 사용자 정보 조회
    /// </summary>
    /// <param name="userId"></param>
    /// <returns><see cref="User"/> 실제 권한이 들어있는 사용자 정보</returns>
    public Task<User> GetUserModelByIdAsync(string userId);

    /// <summary>
    /// 사용자 인증 로직
    /// </summary>
    /// <param name="username"></param>
    /// <param name="password"></param>
    /// <returns></returns>
    public Task<User> AuthenticateAsync(string username, string password);
}