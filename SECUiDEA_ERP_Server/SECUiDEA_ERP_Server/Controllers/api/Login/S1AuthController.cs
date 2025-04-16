using CoreDAL.Configuration.Interface;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Login;

[Route("api/Login/[controller]/[action]")]
public class S1AuthController : Controller
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly UserAuthService _authService;
    private readonly UserRepositoryFactory _userRepositoryFactory;
    private readonly S1UserRepository _userRepository;

    #endregion

    public S1AuthController(IDatabaseSetupContainer dbContainer, UserAuthService authService, UserRepositoryFactory userRepositoryFactory)
    {
        _dbContainer = dbContainer;
        _authService = authService;
        _userRepositoryFactory = userRepositoryFactory;

        // S1UserRepository 인스턴스 생성
        _userRepository = _userRepositoryFactory.GetRepository(StringClass.S1Access) as S1UserRepository;
    }

    /// <summary>
    /// TODO: S1ACCESS 로그인 처리
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<dynamic>> Login([FromBody] LoginRequestModel request)
    {
        try
        {
            // 1. S1ACCESS 인증 처리
            var user = await _userRepository.AuthenticateAsync(request.UserId, request.Password);
            if (user == null)
            {
                return Unauthorized(BoolResultModel.Fail("인증 실패: 사용자 정보가 일치하지 않습니다."));
            }

            // 2. 인증 성공 후 토큰 발급 및 세션 생성
            string ipAddress = GetClientIpAddress();
            var tokenResponse = await _authService.CompleteLoginAsync(
                StringClass.S1Access,
                user,
                ipAddress,
                request.RememberMe);

            // 3. 리프레시 토큰을 쿠키에 저장
            SetRefreshTokenCookie(tokenResponse.RefreshToken);

            // 4. 응답 반환
            return Ok(new
            {
                success = true,
                data = new
                {
                    accessToken = tokenResponse.AccessToken,
                    expiryDate = tokenResponse.ExpiryDate,
                    user = new
                    {
                        id = user.ID,
                        role = user.UserRole
                    }
                }
            });
        }
        catch (Exception ex)
        {
            // 오류 로깅 (실제 구현 시 로깅 서비스 사용)
            return StatusCode(500, BoolResultModel.Fail("서버 오류가 발생했습니다."));
        }
    }
}

/// <summary>
/// User Repository 구현
/// </summary>
public class S1UserRepository : IUserRepository
{
    public string ProviderName => StringClass.S1Access;

    private IDatabaseSetup _dbSetup;

    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;

    public S1UserRepository(IDatabaseSetupContainer dbContainer)
    {
        _dbContainer = dbContainer;
        _dbSetup = _dbContainer.GetSetup(StringClass.S1Access);
    }

    #endregion

    /// <summary>
    /// 사용자 정보 조회
    /// </summary>
    /// <param name="userId"></param>
    /// <returns></returns>
    public Task<User> GetUserModelByIdAsync(string userId)
    {
        // TODO: UserID로 사용자 정보 조회
        // TODO: User에 대한 Role과 Permission 정보도 함께 조회
    }

    /// <summary>
    /// 인증 처리
    /// </summary>
    /// <param name="username"></param>
    /// <param name="password"></param>
    /// <returns></returns>
    public Task<User> AuthenticateAsync(string username, string password)
    {
        // TODO: 실제 사용자 인증 처리 (로그인 로직)
    }

    private async Task LoadUserPermissionsAsync(User user)
    {
        // TODO: 사용자 권한 정보 로드
    }
}