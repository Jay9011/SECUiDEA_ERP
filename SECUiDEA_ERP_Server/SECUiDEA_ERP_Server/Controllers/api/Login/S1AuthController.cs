using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.ControllerModels.api.Login;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Login;

[Route("api/Login/[controller]/[action]")]
public class S1AuthController : Controller
{
    #region 의존 주입

    private readonly UserAuthService _authService;

    #endregion

    public S1AuthController(UserAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// 로그인 요청
    /// </summary>
    /// <returns></returns>
    [HttpPost]
    public async Task<ActionResult<LoginResponseModel>> Login([FromBody] string id, string password)
    {
        try
        {
            var response = await _authService.LoginAsync(request.UserId, request.Password);
            return Ok(BoolResultModel.Success());
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(BoolResultModel.Fail(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, BoolResultModel.Fail("response:오류.서버_오류가_발생했습니다."));
        }
    }
}