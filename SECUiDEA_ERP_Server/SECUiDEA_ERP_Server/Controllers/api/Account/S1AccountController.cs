using System.Security.Claims;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Controllers.Extensions;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Account;

[Route("api/[controller]/[action]")]
public class S1AccountController : BaseController
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbSetupContainer;
    private readonly IDatabaseSetup _s1Setup;
    private readonly ICryptoManager _s1Sha512;
    private readonly UserRepositoryFactory _userRepositoryFactory;

    public S1AccountController(IDatabaseSetupContainer dbSetupContainer,
        [FromKeyedServices(StringClass.CryptoS1Sha512)] ICryptoManager s1Sha512, 
        UserRepositoryFactory userRepositoryFactory)
    {
        _dbSetupContainer = dbSetupContainer;
        _s1Sha512 = s1Sha512;
        _userRepositoryFactory = userRepositoryFactory;

        _s1Setup = _dbSetupContainer.GetSetup(StringClass.S1Access);
    }

    #endregion
    
    [HttpPost]
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
            var apiKeyId = HttpContext.GetApiKeyId();
            var serviceName = HttpContext.GetApiServiceName();
            
            // API 토큰 생성 Issuer가 StringClass.Issuer_Account이고 Authentication이 StringClass.SECUIDEA인 경우에만 성공
            if (string.IsNullOrEmpty(apiKeyId)
                || string.IsNullOrEmpty(serviceName))
            {
                return BadRequest(BoolResultModel.Fail("Invalid API Key. (ErrorCode: 1000)"));
            }
            
            // API 생산 액션이 CheckPasswordCertification 만 허용
            if (serviceName != nameof(AccountController.CheckPasswordCertification))
            {
                return BadRequest(BoolResultModel.Fail("Invalid API Key. (ErrorCode: 1000)"));
            }
            
            // API 인증 CertID가 model에서 가져온 ID와 일치하는지 확인
            var certId = HttpContext.GetApiClaim(StringClass.CertID);
            if (model.ID != certId)
            {
                return BadRequest(BoolResultModel.Fail("Invalid API Key. (ErrorCode: 1300)"));
            }

            #endregion
            
            // 비밀번호 변경 파라미터 설정
            S1AccountPassRegParam param = new S1AccountPassRegParam
            {
                Type = "change",
                Role = model.Role,
                ID = model.ID,
                Password = _s1Sha512.Encrypt(model.Password),
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
    
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> UpdatePassword([FromBody] S1UpdatePasswordModel model)
    {
        try
        {
            #region 인증 인가

            // 로그인 사용자 ID 가져오기
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // 로그인 사용자 Role 가져오기
            var userRoleClaimValue = User.FindFirstValue(ClaimTypes.Role);
            
            // 두 정보 중 하나라도 없으면 인증 실패
            if (string.IsNullOrEmpty(userId)
                || string.IsNullOrEmpty(userRoleClaimValue))
            {
                return Ok(BoolResultModel.Fail("invalidUserAuthentication"));
            }

            #endregion
            
            // 들어온 비밀번호 암호화
            var shaEncryptPassword = _s1Sha512.Encrypt(model.Password);
            // 현재 비밀번호 암호화
            var currentPasswordHash = _s1Sha512.Encrypt(model.CurrentPassword);

            #region 현재 비밀번호 검증

            // 현재 비밀번호가 제공되지 않은 경우
            if (string.IsNullOrEmpty(model.CurrentPassword))
            {
                return Ok(BoolResultModel.Fail("currentPasswordRequired"));
            }
            
            // 사용자 정보 가져오기
            var repository = _userRepositoryFactory.GetRepository(StringClass.S1Access);
            User user = await repository.GetUserModelByIdAsync(userId);

            // 사용자 정보가 없는 경우
            if (user == null)
            {
                return Unauthorized(BoolResultModel.Fail("userNotFound"));
            }
            
            // 현재 비밀번호 검증
            if (user.Password != currentPasswordHash)
            {
                return Ok(BoolResultModel.Fail("currentPasswordIncorrect"));
            }

            #endregion

            // 비밀번호 변경 파라미터 설정
            S1AccountPassRegParam param = new S1AccountPassRegParam
            {
                Type = "change",
                Role = userRoleClaimValue,
                ID = userId,
                Password = shaEncryptPassword,
                UpdateIP = GetClientIpAddress()
            };
            
            // 비밀번호 설정
            var result = await _s1Setup.DAL.ExecuteProcedureAsync(_s1Setup, "SECUiDEA_PasswordREG", param);
            if (result.IsSuccess
                && result.ReturnValue == 1)
            {
                return Ok(BoolResultModel.Success("passwordUpdateSuccess"));
            }
        }
        catch (Exception e)
        {
            return BadRequest(BoolResultModel.Fail(e.Message));
        }
        
        return Ok(BoolResultModel.Fail("passwordUpdateFailed"));
    }
}