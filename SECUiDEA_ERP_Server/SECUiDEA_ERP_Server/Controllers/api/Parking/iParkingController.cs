using APIClient.Authentication.Models;
using APIClient.Client;
using APIClient.Client.Interfaces;
using APIClient.Configuration.Interfaces;
using APIClient.Configuration.Models;
using APIClient.Models;
using APIClient.Models.Interfaces;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Controllers.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.Parking;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Parking;

[Route("api/[controller]/[action]")]
public class IParkingController : BaseController
{
    #region 상수 정의

    private const string Selector = "SelectVisitCar";
    private const string Register = "RegistVisitCar";
    private const string EncryptedId = "EncryptedId";
    private const string EncryptedPwd = "EncryptedPwd";
    private const string EncryptedDestinationId = "EncryptedDestinationId";

    #endregion
    
    #region 의존 주입

    private readonly ICryptoManager _crypto;
    private readonly IAPISetupContainer _apiContainer;
    private readonly IAPISetup _apiSetup;
    private readonly ICoreAPI _coreApi;

    public IParkingController(
        [FromKeyedServices(StringClass.CryptoSecuidea)] ICryptoManager crypto, 
        IAPISetupContainer apiContainer
        )
    {
        _crypto = crypto;
        _apiContainer = apiContainer;
        _apiSetup = _apiContainer.GetSetup(StringClass.IParking);
        
        // 만약 _apiSetup에 기본 URL이 설정되어 있지 않다면, 하드코딩으로 최초 설정 세팅
        if (string.IsNullOrEmpty(_apiSetup.GetConnectionInfo().BaseUrl))
        {
            var connectionInfo = new APIConnectionInfo
            {
                BaseUrl = "https://apis.stg.iparking.co.kr/api-proxies/",
                Endpoints = new Dictionary<string, string>
                {
                    [Selector] = "/api/api-proxy/v1/visit-car",
                    [Register] = "/api/api-proxy/v1/visit-car"
                }
            };
            
            _apiSetup.UpdateConnectionInfo(connectionInfo);
        }
        
        _coreApi = new CoreAPIClient(_apiSetup);
    }

    #endregion

    /// <summary>
    /// 방문 차량 등록
    /// </summary>
    /// <param name="visitCarModel">
    /// <see cref="VisitCarModel"/> 차량 방문 등록 모델
    /// </param>
    /// <returns></returns>
    [HttpPost]
    [ApiKeyAuth(issuer: StringClass.Issuer_Parking)]
    public async Task<IActionResult> VisitCar([FromBody] VisitCarModel visitCarModel)
    {
        #region 인증 검사

        try
        {
            // API Key 인증
            var apiKeyId = HttpContext.GetApiKeyId();
            var serviceName = HttpContext.GetApiServiceName();
            
            if (string.IsNullOrEmpty(apiKeyId)
                || string.IsNullOrEmpty(serviceName))
            {
                return BadRequest(BoolResultModel.Fail("invalidApiKey"));
            }
        }
        catch (Exception e)
        {
            
        }
        
        #endregion

        string? id = null;
        string? password = null;
        string? destinationId = null;
        
        // API Setup에서 암호화된 ID, 비밀번호, 목적지 ID를 가져옴
        try
        {
            id = _apiSetup.ConnectionInfo.GetEndpoint(EncryptedId);
            id = _crypto.Decrypt(id);
            
            password = _apiSetup.ConnectionInfo.GetEndpoint(EncryptedPwd);
            password = _crypto.Decrypt(password);
            
            destinationId = _apiSetup.ConnectionInfo.GetEndpoint(EncryptedDestinationId);
            destinationId = _crypto.Decrypt(destinationId);
        }
        catch (Exception e)
        {
            return BadRequest(BoolResultModel.Fail("invalidApiIdOrPassword"));
        }
        
        // API 호출
        try
        {
            // 추가 Header 설정
            var header = new Dictionary<string, string>
            {
                ["Destination-Id"] = destinationId
            };
            
            // Body 생성
            var body = new Dictionary<string, string>
            {
                ["carNumber"] = visitCarModel.CarNumber,
                ["startDate"] = visitCarModel.StartDate.ToString("yyyy-MM-dd"),
                ["endDate"] = visitCarModel.EndDate.ToString("yyyy-MM-dd")
            };

            if (visitCarModel.Dong != null
                && !string.IsNullOrEmpty(visitCarModel.Dong))
            {
                body["dong"] = visitCarModel.Dong;
            }
            
            if (visitCarModel.Hosu != null
                && !string.IsNullOrEmpty(visitCarModel.Hosu))
            {
                body["hosu"] = visitCarModel.Hosu;
            }
            
            if (visitCarModel.Memo != null
                && !string.IsNullOrEmpty(visitCarModel.Memo))
            {
                body["memo"] = visitCarModel.Memo;
            }
            
            // Request 생성
            IAPIRequest request = new APIRequest
            {
                Authentication = BasicAuthentication.FromUserPass(id, password),
                Headers = header,
                Body = RequestBody.CreateJson(body)
            };
            
            APIResponse<JObject> result = await _coreApi.PostAsync<JObject>(Register, request);
            
            // 응답코드(result-code) 확인
            if (result.IsSuccess
                && result.Headers.TryGetValue("result-code", out var resultCode))
            {
                // 성공은 result-code가 "10201"
                if (resultCode == "10201")
                {
                    // 차량 등록 성공
                    return Ok(BoolResultModel.Success("visitCarRegistered"));
                }
                
                /*
                 * 차량 등록 실패
                 */
                string resultMessage;
                
                if (!result.Headers.TryGetValue("result-message", out resultMessage))
                {
                    // result-message가 없으면 기본 메시지 사용
                    switch (resultCode)
                    {
                        case "10401":
                            resultMessage = "AUTHENTICATION ID IS REQUIRED";
                            break;
                        case "10402":
                            resultMessage = "SERVICE NOT FOUND";
                            break;
                        case "10403":
                            resultMessage = "JSON PARSE ERROR";
                            break;
                        case "10500":
                            resultMessage = "SERVER ERROR";
                            break;
                        case "11003":
                            resultMessage = "DUPLICATED CAR NUMBER IN PERIOD VISIT CAR";
                            break;
                        case "11004":
                            resultMessage = "DUPLICATED CAR NUMBER IN PERIOD REGULAR TICKET";
                            break;
                        case "11011":
                            resultMessage = "CAR NUMBER IS REQUIRED";
                            break;
                        case "11012":
                            resultMessage = "CAR NUMBER IS INVALID";
                            break;
                        case "11013":
                            resultMessage = "START DATE IS REQUIRED";
                            break;
                        case "11014":
                            resultMessage = "END DATE IS REQUIRED";
                            break;
                        case "11015":
                            resultMessage = "DONG LENGTH OVER";
                            break;
                        case "11016":
                            resultMessage = "HOSU LENGTH OVER";
                            break;
                        case "11017":
                            resultMessage = "MEMO LENGTH OVER";
                            break;
                        case "11019":
                            resultMessage = "START DATE IS EQUAL OR BEFORE END DATE";
                            break;
                    }
                }
                
                // result-message를 다국어 키로 활용하기 위해 소문자 변환 및 공백 제거 실행
                resultMessage = resultMessage.ToLower().Replace(" ", "");
                
                var authString = result.Data["auth"]?.ToString();
                
                return Ok(BoolResultModel.Fail("visitCarRegisterFailed", new Dictionary<string, object>
                {
                    { "resultCode", resultCode },
                    { "resultMessage", resultMessage },
                    { "auth", authString }
                }));
            }
        }
        catch (Exception e)
        {
            return Ok(BoolResultModel.Fail("apiCallError"));
        }

        return Ok(BoolResultModel.Fail("visitCarRegisterFailed"));
    }
}