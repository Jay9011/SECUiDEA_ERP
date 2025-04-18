using CoreDAL.Configuration.Interface;
using CoreDAL.ORM.Extensions;
using CryptoManager;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.api.Login.S1AuthModel;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Login;

[Route("api/Login/[controller]/[action]")]
public class S1AuthController : BaseController
{
    #region 의존 주입

    private readonly ICryptoManager _cryptoSha512;
    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly UserAuthService _authService;
    private readonly UserRepositoryFactory _userRepositoryFactory;
    private readonly S1UserRepository _userRepository;

    #endregion

    private readonly IDatabaseSetup _dbSetup;

    public S1AuthController(IDatabaseSetupContainer dbContainer, UserAuthService authService, UserRepositoryFactory userRepositoryFactory, [FromKeyedServices(StringClass.CryptoS1Sha512)] ICryptoManager cryptoSha512)
    {
        #region 의존 주입

        _dbContainer = dbContainer;
        _authService = authService;
        _userRepositoryFactory = userRepositoryFactory;
        _cryptoSha512 = cryptoSha512;

        #endregion

        // DBSetup 인스턴스 생성
        _dbSetup = _dbContainer.GetSetup(StringClass.S1Access);

        // S1UserRepository 인스턴스 생성
        _userRepository = _userRepositoryFactory.GetRepository(StringClass.S1Access) as S1UserRepository;
    }

    /// <summary>
    /// S1ACCESS 로그인 처리
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] S1UserDTO request)
    {
        try
        {
            // S1ACCESS 인증 처리
            var user = await _userRepository.AuthenticateAsync(request.Id, _cryptoSha512.Encrypt(request.Password));
            if (user == null)
            {
                return Unauthorized(BoolResultModel.Fail("인증 실패: 사용자 정보가 일치하지 않습니다."));
            }

            // 인증 성공 후 토큰 발급 및 세션 생성
            string ipAddress = GetClientIpAddress();
            var tokenResponse = await _authService.CompleteLoginAsync(
                _userRepository.ProviderName,
                user,
                ipAddress,
                request.rememberMe);

            return Ok(BoolResultModel.Success("",
                new Dictionary<string, object>
                {
                    { "token", tokenResponse }
                }));
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
    public async Task<User> GetUserModelByIdAsync(string userId)
    {
        var param = new S1UserParams
        {
            ID = userId
        };

        var result = await _dbSetup.DAL.ExecuteProcedureAsync(_dbSetup, "SECUiDEA_GetUserById_SEL", param);

        if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
        {
            var userEntity = result.DataSet.Tables[0].Rows[0].ToObject<S1UserTable>();

            // 결과 확인
            if (userEntity.AuthType.Equals("Fail"))
            {
                return null;
            }

            var user = new User
            {
                ID = userEntity.Id,
                UserRole = userEntity.AuthType
            };

            // 권한 정보 로드
            await LoadUserPermissionsAsync(user);

            return user;
        }

        return null;
    }

    /// <summary>
    /// 인증 처리
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="password"></param>
    /// <returns></returns>
    public async Task<User> AuthenticateAsync(string userId, string password)
    {
        var param = new S1UserParams
        {
            ID = userId
        };

        var result = await _dbSetup.DAL.ExecuteProcedureAsync(_dbSetup, "SECUiDEA_GetUserById_SEL", param);

        if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
        {
            var userEntity = result.DataSet.Tables[0].Rows[0].ToObject<S1UserTable>();

            // 결과 확인
            if (userEntity.AuthType.Equals("Fail"))
            {
                return null;
            }

            // 비밀번호 검증
            if (userEntity.Password != password)
            {
                return null;
            }

            var user = new User
            {
                ID = userEntity.Id,
                Name = userEntity.Name,
                UserRole = userEntity.AuthType
            };

            // 권한 정보 로드
            await LoadUserPermissionsAsync(user);

            return user;
        }

        return null;
    }

    private async Task LoadUserPermissionsAsync(User user)
    {
        return;
    }
}