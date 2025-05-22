using System.Security.Claims;
using CoreDAL.Configuration.Interface;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Controllers.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Account;

[Route("api/[controller]/[action]")]
public class S1AccountController : BaseController
{
    #region 의존 주입

    private IDatabaseSetupContainer _dbSetupContainer;
    private IDatabaseSetup _s1Setup;

    public S1AccountController(IDatabaseSetupContainer dbSetupContainer)
    {
        _dbSetupContainer = dbSetupContainer;
        
        _s1Setup = _dbSetupContainer.GetSetup(StringClass.S1Access);
    }

    #endregion
    
    [HttpGet]
    public async Task<IActionResult> FindUserByIdAndMobile([FromBody] AccountMobileModel model)
    {
        try
        {
            var result = await _s1Setup.DAL.ExecuteProcedureAsync(_s1Setup, "SECUiDEA_AccountFindSEL", model);
            if (result.IsSuccess
                && result.ReturnValue == 1)
            {
                // 성공한 경우 Message와 AuthType을 반환
                var data = result.DataSet.Tables[0].Rows[0];
                var message = data["Message"].ToString();
                var authType = data["AuthType"].ToString();
                
                return Ok(BoolResultModel.Success(message, new Dictionary<string, object>
                {
                    { "AuthType", authType }
                }));
            }
            else if (result.IsSuccess
                     && result.ReturnValue == 0)
            {
                // 실패한 경우 Message를 반환
                var data = result.DataSet.Tables[0].Rows[0];
                var message = data["Message"].ToString();
                
                return Ok(BoolResultModel.Fail(message));
            }
        }
        catch (Exception e)
        {
            return BadRequest(BoolResultModel.Fail(e.Message));
        }
        
        return BadRequest(BoolResultModel.Fail("Failed to find user."));
    }
    
    [HttpPost]
    [ApiKeyAuth(issuer: StringClass.Issuer_Account)]
    public async Task<IActionResult> SetPassword([FromBody] S1AccountModel model)
    {
        try
        {
            #region 인증 검사

            // API Key 인증
            var apiKeyId = HttpContext.Items[ClaimTypes.Authentication] as string;
            var serviceName = HttpContext.Items[ClaimTypes.AuthenticationMethod] as string;
            
            // API 생산 액션이 CheckPasswordCertification 만 허용
            if (serviceName != nameof(AccountController.CheckPasswordCertification))
            {
                return BadRequest(BoolResultModel.Fail("Invalid API Key."));
            }

            #endregion
            
            // 비밀번호 변경 파라미터 설정
            S1AccountPassRegParam param = new S1AccountPassRegParam
            {
                Type = "change",
                Role = model.Role,
                ID = model.ID,
                Password = model.Password,
                UpdateIP = GetClientIpAddress()
            };
            
            // 비밀번호 설정
            var result = await _s1Setup.DAL.ExecuteProcedureAsync(_s1Setup, "SECUiDEA_PasswordREG", param);
            if (result.IsSuccess
                && result.ReturnValue == 1)
            {
                return Ok(BoolResultModel.Success("Password changed successfully."));
            }
        }
        catch (Exception e)
        {
            return BadRequest(BoolResultModel.Fail(e.Message));
        }
        
        return Ok(BoolResultModel.Fail("Failed to set password."));
    }
}