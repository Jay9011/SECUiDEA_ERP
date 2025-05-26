using System.Security.Claims;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Models.Account;
using SECUiDEA_ERP_Server.Models.Authentication;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Account;

[Route("api/[controller]/[action]")]
public class AccountController : JwtController
{
    #region 의존 주입

    private readonly ICryptoManager _crypto;
    private readonly IDatabaseSetupContainer _dbSetupContainer;
    private readonly IDatabaseSetup _dbSetup;

    public AccountController(JwtService jwtService,
        [FromKeyedServices(StringClass.CryptoSecuidea)] ICryptoManager crypto, 
        IDatabaseSetupContainer dbSetupContainer)
    : base(jwtService)
    {
        _crypto = crypto;
        _dbSetupContainer = dbSetupContainer;
        
        _dbSetup = _dbSetupContainer.GetSetup(StringClass.SECUIDEA);
    }

    #endregion
    
    // 혼동되기 쉬운 문자(0과 O, 1과 I)를 제외한 Base32 문자셋
    const string BASE32_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWX";
    
    /// <summary>
    /// 비밀번호 찾기용 인증번호 생성
    /// </summary>
    /// <param name="mobileModel">모바일 번호가 포함된 인증 모델</param>
    /// <returns></returns>
    [HttpPost]
    public async Task<IActionResult> CreatePasswordCertification([FromBody] PassCertMobileModel mobileModel)
    {
        try
        {
            mobileModel.UpdateIp = GetClientIpAddress();
            mobileModel.Type = "reg";
            
            // 인증 Token 생성
            var token = GenerateRandomToken(6);
            mobileModel.CertificateData = token;
            
            // 인증 Token을 DB에 저장
            var result = await _dbSetup.DAL.ExecuteProcedureAsync(_dbSetup, "PassCert_Mobile", mobileModel);
            if (result.IsSuccess
                && result.ReturnValue == 1)
            {
                var data = result.DataSet.Tables[0].Rows[0];
                var message = data["Message"].ToString();
                
                return Ok(BoolResultModel.Success(message, new Dictionary<string, object>
                {
                    { "data", mobileModel },
                    { "ApiKey", _jwtService.GenerateApiKeyToken(StringClass.Issuer_Kakao, StringClass.SECUIDEA, nameof(CreatePasswordCertification))}
                }));

            }
            else if (result.DataSet?.Tables.Count > 0
                     && result.DataSet.Tables[0].Rows.Count > 0)
            {
                var data = result.DataSet.Tables[0].Rows[0];
                var message = data["Message"].ToString();
                
                return Ok(BoolResultModel.Fail(message));
            }
        }
        catch (Exception e)
        {
            return BadRequest(BoolResultModel.Fail(e.Message));
        }
        
        return BadRequest(BoolResultModel.Fail("Failed to create password certification."));
    }
    
    /// <summary>
    /// 비밀번호 찾기용 인증번호 확인
    /// </summary>
    /// <param name="mobileModel">모바일 번호가 포함된 인증 모델</param>
    /// <returns></returns>
    public async Task<IActionResult> CheckPasswordCertification([FromBody] PassCertMobileModel mobileModel)
    {
        try
        {
            mobileModel.Type = "check";
            
            var result = await _dbSetup.DAL.ExecuteProcedureAsync(_dbSetup, "PassCert_Mobile", mobileModel);
            if (result.IsSuccess
                && result.ReturnValue == 1)
            {
                var data = result.DataSet.Tables[0].Rows[0];
                var message = data["Message"].ToString();
                
                // Certification이 성공한 Id만 인증된 것으로 간주
                var additionalClaims = new List<Claim>
                {
                    new Claim(StringClass.CertID, mobileModel.Id)
                };
                
                // 인증에 성공하면 이후 인증/인가용 JWT 토큰을 발급
                return Ok(BoolResultModel.Success(message, new Dictionary<string, object>
                {
                    { "ApiKey", _jwtService.GenerateApiKeyToken(StringClass.Issuer_Account, StringClass.SECUIDEA, nameof(CheckPasswordCertification)
                        , TimeSpan.FromMinutes(60)
                        , additionalClaims
                    ) }
                }));
            }
            else if (result.DataSet?.Tables.Count > 0
                     && result.DataSet.Tables[0].Rows.Count > 0)
            {
                var data = result.DataSet.Tables[0].Rows[0];
                var message = data["Message"].ToString();
                
                return Ok(BoolResultModel.Fail(message));
            }
        }
        catch (Exception e)
        {
            return BadRequest(BoolResultModel.Fail(e.Message));
        }
        
        return BadRequest(BoolResultModel.Fail("Failed to check password certification."));
    }
    
    /// <summary>
    /// Base32로 인코딩된 랜덤 토큰을 생성.
    /// 알아보기 쉬운 숫자와 문자로만 구성되며, 혼동되기 쉬운 문자(0과 O, 1과 I)는 제외.
    /// 알파벳은 대문자로만 사용.
    /// </summary>
    /// <param name="length">생성할 토큰의 길이</param>
    /// <returns>지정된 길이의 랜덤 토큰</returns>
    public string GenerateRandomToken(int length)
    {
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var bytes = new byte[length];
        rng.GetBytes(bytes);
        
        // 랜덤 바이트를 Base32 문자로 변환
        return new string(bytes.Select(b => BASE32_CHARS[b % BASE32_CHARS.Length]).ToArray());
    }
}