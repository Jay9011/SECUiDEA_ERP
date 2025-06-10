using System.Text;
using APIClient.Authentication.Models;
using APIClient.Client;
using APIClient.Client.Interfaces;
using APIClient.Configuration.Interfaces;
using APIClient.Configuration.Models;
using APIClient.Models;
using APIClient.Models.Interfaces;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using FileIOHelper;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Controllers.Extensions;
using SECUiDEA_ERP_Server.Models.APIServices;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.Private;
using SECUiDEA_ERP_Server.Models.Parking;
using SECUiDEA_ERP_Server.Models.ResultModels;
using System.Text.Json;

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

    private static readonly List<string> EndpointsStrings = new()
    {
        Selector, Register, EncryptedId, EncryptedPwd, EncryptedDestinationId
    };

    #endregion
    
    #region 의존 주입

    private readonly ICryptoManager _crypto;
    private readonly IIOHelper _ioHelper;
    private readonly IAPISetupContainer _apiContainer;
    private readonly IAPISetup _apiSetup;
    private readonly ICoreAPI _coreApi;
    private readonly IParkingSetupService _setupService;

    public IParkingController(
        [FromKeyedServices(StringClass.CryptoSecuidea)] ICryptoManager crypto, 
        [FromKeyedServices(StringClass.IoApiSetupFile)] IIOHelper ioHelper,
        IAPISetupContainer apiContainer)
    {
        _crypto = crypto;
        _ioHelper = ioHelper;
        _apiContainer = apiContainer;
        _apiSetup = _apiContainer.GetSetup(StringClass.IParking);
        _setupService = new IParkingSetupService(_apiContainer);

        // 만약 _apiSetup에 기본 URL이 설정되어 있지 않다면, 하드코딩으로 최초 설정 세팅
        if (string.IsNullOrEmpty(_apiSetup.GetConnectionInfo().BaseUrl))
        {
            InitializeApiConnectionInfo();
        }
        
        // 만약 Endpoints 중 하나라도 없으면 다시 설정
        if (_apiSetup.GetConnectionInfo().Endpoints.Count < EndpointsStrings.Count)
        {
            InitializeApiConnectionInfo();
        }
        
        _coreApi = new CoreAPIClient(_apiSetup, ignoreSslErrors: true);
    }

    #endregion

    #region API Setup
    
    [LocalHostOnly]
    [HttpGet]
    public async Task<IActionResult> Setup()
    {
        APISetupViewModel setup = null;
        
        try
        {
            setup = _setupService.GetSetup(StringClass.IParking);
        }
        catch (FileNotFoundException)
        {
            Program.SetupApiContainer(_ioHelper);
        }

        if (setup == null)
        {
            _setupService.GetSetup(StringClass.IParking);            
        }
        
        DecryptEndpoints(setup.EndPoints);

        return View(setup);
    }
    
    [LocalHostOnly]
    [HttpPost]
    public async Task<IActionResult> SaveSingleSetup([FromForm] APISetupViewModel setting)
    {
        EncryptEndpoints(setting.EndPoints);
        
        var result = _setupService.SaveSingleSetupAsync(setting);

        return Ok(result);
    }
    
    #endregion

    [HttpGet]
    [ApiKeyAuth(issuer: StringClass.Issuer_Parking)]
    public async Task<IActionResult> VisitCar(string? carNumber, DateTime? startDate, DateTime? endDate, 
        int? periodType = 1, int? currentPage = 1, int? pageSize = 10)
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

        string? id;
        string? password;
        string? destinationId;

        if (!GetDecryptedApiCredentials(out id, out password, out destinationId))
        {
            return BadRequest(BoolResultModel.Fail("invalidApiKey"));
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
            var body = new Dictionary<string, string>();
            
            if (carNumber != null
                && !string.IsNullOrEmpty(carNumber))
            {
                body["carNumber"] = carNumber;
            }
            
            if (startDate != null
                && startDate != DateTime.MinValue)
            {
                body["startDate"] = startDate.Value.ToString("yyyy-MM-dd HH:mm:ss");
            }
            
            if (endDate != null
                && endDate != DateTime.MinValue)
            {
                body["endDate"] = endDate.Value.ToString("yyyy-MM-dd HH:mm:ss");
            }
            
            body["periodType"] = periodType.ToString();
            body["currentPage"] = currentPage.ToString();
            body["pageSize"] = pageSize.ToString();
            
            // Request 생성
            IAPIRequest request = new APIRequest
            {
                Authentication = BasicAuthentication.FromUserPass(id, password),
                Headers = header,
                Body = RequestBody.CreateJson(body)
            };
            
            APIResponse<VisitCarResponseModel> result = await _coreApi.GetAsync<VisitCarResponseModel>(Selector, request);

            if (result.IsSuccess
                && result.Data.TotalCount > 0)
            {
                return Ok(BoolResultModel.Success("visitCarFound", new Dictionary<string, object>
                {
                    { "visitCars", result.Data.List },
                    { "totalCount", result.Data.TotalCount },
                    { "currentPage", result.Data.CurrentPage }
                }));
            }
        }
        catch (Exception e)
        {
            return Ok(BoolResultModel.Fail("apiCallError"));
        }

        return Ok(BoolResultModel.Fail("visitCarNotFound"));
    }
    
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

        string? id;
        string? password;
        string? destinationId;
        
        if (!GetDecryptedApiCredentials(out id, out password, out destinationId))
        {
            return BadRequest(BoolResultModel.Fail("invalidApiKey"));
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

    private bool GetDecryptedApiCredentials(out string? id, out string? password, out string? destinationId)
    {
        id = null;
        password = null;
        destinationId = null;
        
        // API Setup에서 암호화된 ID, 비밀번호, 목적지 ID를 가져옴
        try
        {
            id = _apiSetup.GetConnectionInfo().GetEndpoint(EncryptedId);
            id = _crypto.Decrypt(id);
            
            password = _apiSetup.GetConnectionInfo().GetEndpoint(EncryptedPwd);
            password = _crypto.Decrypt(password);
            
            destinationId = _apiSetup.GetConnectionInfo().GetEndpoint(EncryptedDestinationId);
            destinationId = _crypto.Decrypt(destinationId);

            return true;
        }
        catch (Exception e)
        {
            return false;
        }
        
        return false;
    }

    /// <summary>
    /// API 최초 설정
    /// </summary>
    /// <returns></returns>
    private APIConnectionInfo InitializeApiConnectionInfo()
    {
        var connectionInfo = new APIConnectionInfo
        {
            BaseUrl = "https://apis.stg.iparking.co.kr/api-proxies/",
            Endpoints = new Dictionary<string, string>
            {
                [Selector] = "/api/api-proxy/v1/visit-car",
                [Register] = "/api/api-proxy/v1/visit-car",
                [EncryptedId] = string.Empty,
                [EncryptedPwd] = string.Empty,
                [EncryptedDestinationId] = string.Empty
            }
        };

        _apiSetup.UpdateConnectionInfo(connectionInfo);
        return connectionInfo;
    }

    /// <summary>
    /// IParking 시스템의 암호화 된 일부 정보를 복호화 하여 읽음
    /// </summary>
    /// <param name="encryptedEndpoints"></param>
    private void DecryptEndpoints(Dictionary<string, string> encryptedEndpoints)
    {
        foreach (var (key, value) in encryptedEndpoints)
        {
            if (string.Equals(key, EncryptedId)
                || string.Equals(key, EncryptedPwd)
                || string.Equals(key, EncryptedDestinationId))
            {
                encryptedEndpoints[key] = _crypto.Decrypt(value);
            }
        }
    }
    
    /// <summary>
    /// IParking 시스템의 일부 정보를 암호화하여 저장
    /// </summary>
    /// <param name="plainEndpoints"></param>
    private void EncryptEndpoints(Dictionary<string, string> plainEndpoints)
    {
        foreach (var (key, value) in plainEndpoints)
        {
            if (string.Equals(key, EncryptedId)
                || string.Equals(key, EncryptedPwd)
                || string.Equals(key, EncryptedDestinationId))
            {
                plainEndpoints[key] = _crypto.Encrypt(value);
            }
        }
    }

#if DEBUG

    [HttpGet]
    public async Task<IActionResult> TestGetVisitCarList(string? carNumber, DateTime? startDate, DateTime? endDate)
    {
        string? id;
        string? password;
        string? destinationId;

        if (!GetDecryptedApiCredentials(out id, out password, out destinationId))
        {
            return BadRequest(BoolResultModel.Fail("invalidApiKey"));
        }
        
        // API 호출
        try
        {
            // 추가 Header 설정
            var header = new Dictionary<string, string>
            {
                ["Destination-Id"] = destinationId
            };
            
            // Query 생성
            var query = new Dictionary<string, string>();
            
            if (carNumber != null
                && !string.IsNullOrEmpty(carNumber))
            {
                query["carNumber"] = carNumber;
            }
            
            if (startDate != null
                && startDate != DateTime.MinValue)
            {
                query["startDate"] = startDate.Value.ToString("yyyy-MM-dd HH:mm:ss");
            }
            
            if (endDate != null
                && endDate != DateTime.MinValue)
            {
                query["endDate"] = endDate.Value.ToString("yyyy-MM-dd HH:mm:ss");
            }
            
            // Request 생성
            IAPIRequest request = new APIRequest
            {
                Authentication = BasicAuthentication.FromUserPass(id, password),
                Headers = header,
                QueryParameters = query
            };
            
            APIResponse<VisitCarResponseModel> result = await _coreApi.GetAsync<VisitCarResponseModel>(Selector, request);

            if (result.IsSuccess
                && result.Data.TotalCount > 0)
            {
                return Ok(BoolResultModel.Success("visitCarFound", new Dictionary<string, object>
                {
                    { "visitCars", result.Data.List },
                    { "totalCount", result.Data.TotalCount },
                    { "currentPage", result.Data.CurrentPage }
                }));
            }
        }
        catch (Exception e)
        {
            return Ok(BoolResultModel.Fail("apiCallError"));
        }

        return Ok(BoolResultModel.Fail("visitCarNotFound"));
    }
    
    [HttpGet]
    public async Task<IActionResult> TestResponseVisitCarList(string? carNumber, DateTime? startDate, DateTime? endDate, 
        int? periodType = 1, int? currentPage = 1, int? pageSize = 10)
    {
        // 요청 헤더 검증
        string authHeader = Request.Headers["Authorization"].FirstOrDefault() ?? string.Empty;
        string destinationId = Request.Headers["Destination-Id"].FirstOrDefault() ?? string.Empty;
        
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Basic "))
        {
            Response.Headers.Add("result-code", "10401");
            Response.Headers.Add("result-message", "AUTHENTICATION ID IS REQUIRED");
            return StatusCode(401, new { error = "인증 정보가 없거나 잘못되었습니다." });
        }
        
        if (string.IsNullOrEmpty(destinationId))
        {
            Response.Headers.Add("result-code", "10402");
            Response.Headers.Add("result-message", "DESTINATION ID IS REQUIRED");
            return StatusCode(401, new { error = "목적지 ID가 없습니다." });
        }
        
        try
        {
            // Basic 인증 디코딩 (실제로는 검증만 하고 사용하지 않음)
            string encodedCredentials = authHeader.Substring("Basic ".Length).Trim();
            byte[] credentialBytes = Convert.FromBase64String(encodedCredentials);
            string credentials = Encoding.UTF8.GetString(credentialBytes);
            string[] parts = credentials.Split(':');
            
            if (parts.Length != 2)
            {
                Response.Headers.Add("result-code", "10401");
                Response.Headers.Add("result-message", "INVALID CREDENTIALS FORMAT");
                return StatusCode(401, new { error = "인증 정보 형식이 잘못되었습니다." });
            }
        }
        catch
        {
            Response.Headers.Add("result-code", "10401");
            Response.Headers.Add("result-message", "INVALID CREDENTIALS");
            return StatusCode(401, new { error = "인증 정보가 잘못되었습니다." });
        }
        
        // 응답 헤더 설정
        Response.Headers.Add("result-code", "10200");
        Response.Headers.Add("result-message", "SUCCESS");
        Response.Headers.Add("Content-Type", "application/json");
        
        // JSON 문자열로 직접 응답 생성
        string jsonResponse;
        
        // 특정 차량번호일 경우 더미 데이터 2개 반환 (12가3456)
        if (carNumber == "12가3456")
        {
            jsonResponse = @"{
                ""List"": [
                    {
                        ""VisitCarSeq"": 1,
                        ""CarNumber"": ""12가3456"",
                        ""StartDate"": """ + DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd HH:mm:ss") + @""",
                        ""EndDate"": """ + DateTime.Now.AddDays(5).ToString("yyyy-MM-dd HH:mm:ss") + @""",
                        ""Dong"": ""101"",
                        ""Hosu"": ""1001"",
                        ""Memo"": ""방문객 1"",
                        ""Auth"": true
                    },
                    {
                        ""VisitCarSeq"": 2,
                        ""CarNumber"": ""12가3456"",
                        ""StartDate"": """ + DateTime.Now.AddDays(-2).ToString("yyyy-MM-dd HH:mm:ss") + @""",
                        ""EndDate"": """ + DateTime.Now.AddDays(10).ToString("yyyy-MM-dd HH:mm:ss") + @""",
                        ""Dong"": ""102"",
                        ""Hosu"": ""2001"",
                        ""Memo"": ""방문객 2"",
                        ""Auth"": true
                    }
                ],
                ""CurrentPage"": " + (currentPage ?? 1) + @",
                ""TotalCount"": 2
            }";
        }
        // null 가능한 데이터에 null이 들어있는 데이터 1개 반환 (34나5678)
        else if (carNumber == "34나5678")
        {
            jsonResponse = @"{
                ""CurrentPage"": " + (currentPage ?? 1) + @",
                ""TotalCount"": 1,
                ""List"": [
                    {
                        ""VisitCarSeq"": 3,
                        ""CarNumber"": ""34나5678"",
                        ""StartDate"": """ + DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss") + @""",
                        ""EndDate"": """ + DateTime.Now.AddDays(3).ToString("yyyy-MM-dd HH:mm:ss") + @""",
                        ""Auth"": false
                    }
                ]
            }";
        }
        // 그 외의 경우 빈 리스트 반환
        else
        {
            jsonResponse = @"{
                ""CurrentPage"": " + (currentPage ?? 1) + @",
                ""TotalCount"": 0,
                ""List"": []
            }";
        }
        
        // JSON 문자열을 직접 반환
        return Content(jsonResponse, "application/json");
    }

#endif
}

public class IParkingSetupService : IAPISetupService
{
    /*
     * IParking 쪽에서 계정정보는 ID, PW, Destination-Id로 구성되어 있으며
     * 이 정보들은 기밀 내용이기 때문에 암호화하여 저장하고 사용.
     */

    #region 의존 주입

    private readonly IAPISetupContainer _apiContainer;

    public IParkingSetupService(IAPISetupContainer apiContainer)
    {
        _apiContainer = apiContainer;
    }

    #endregion
    
    public async Task<BoolResultModel> SaveSingleSetupAsync(APISetupViewModel setting)
    {
        try
        {
            var connectionInfo = new APIConnectionInfo
            {
                BaseUrl = setting.BaseUrl,
                Endpoints = setting.EndPoints
            };
            
            _apiContainer.UpdateSetup(setting.SectionName, connectionInfo);
            
            return BoolResultModel.Success("response:기본.{{what}} 설정이 성공적으로 저장되었습니다.",
                new Dictionary<string, object>
                {
                    { "what", setting.SectionName }
                });
        }
        catch (Exception e)
        {
            return BoolResultModel.Fail(e.Message);
        }
    }

    public async Task<BoolResultModel> SaveMultiSetupAsync(List<APISetupViewModel> settings)
    {
        try
        {
            foreach (var setting in settings)
            {
                var result = await SaveSingleSetupAsync(setting);
                if (!result.IsSuccess)
                {
                    return result;
                }
            }
            
            return BoolResultModel.Success("response:기본.{{what}} 설정이 성공적으로 저장되었습니다.",
                new Dictionary<string, object>
                {
                    { "what", "API.API설정" }
                });
        }
        catch (Exception e)
        {
            return BoolResultModel.Fail(e.Message);
        }
    }

    public APISetupViewModel? GetSetup(string setupName)
    {
        var setup = _apiContainer.GetSetup(setupName);

        if (setup == null)
        {
            return null;
        }
        
        var connectionInfo = setup.GetConnectionInfo();
        
        return new APISetupViewModel
        {
            SectionName = setupName,
            BaseUrl =connectionInfo.BaseUrl,
            EndPoints = connectionInfo.Endpoints
        };
    }

    public List<APISetupViewModel> GetAllSetups()
    {
        return _apiContainer.Setups.Select(setup => new APISetupViewModel
        {
            SectionName = setup.Key,
            BaseUrl = setup.Value.ConnectionInfo.BaseUrl,
            EndPoints = setup.Value.ConnectionInfo.Endpoints
        }).ToList();
    }
} 