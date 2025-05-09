using APIClient.Authentication.Models;
using APIClient.Client;
using APIClient.Client.Interfaces;
using APIClient.Configuration;
using APIClient.Configuration.Interfaces;
using APIClient.Configuration.Models;
using APIClient.Models;
using APIClient.Models.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.api.NLobby;

namespace SECUiDEA_ERP_Server.Controllers.api.NLobby;

public class NLobbyController : BaseController
{
    #region 상수 정의

    private const string NLobby = "NLobby";
    private const string GetAuthToken = "GetAuthToken";
    private const string S1TokenID = "apiuser";
    private const string S1TokenEmail = "api@api.com";
    private const string SetHRPerson = "SetHRPerson";

    #endregion

    #region 의존 주입

    private readonly APISetupContainer _apiSetupContainer;
    private readonly IAPISetup _apiSetup;
    private readonly ICoreAPI _coreApi;

    public NLobbyController(APISetupContainer apiSetupContainer)
    {
        _apiSetupContainer = apiSetupContainer;
        _apiSetup = _apiSetupContainer.GetSetup(StringClass.Nlobby);

        // 일단 하드코딩으로 설정 (추후 설정 페이지 등으로 변경 필요)
        var connectionInfo = new APIConnectionInfo
        {
            BaseUrl = "https://127.0.0.1:3553",
            Endpoints = new Dictionary<string, string>
            {
                [SetHRPerson] = "/CommonAPIv2/SetHRPerson",
                [GetAuthToken] = "/CommonAPIv2/GetAuthToken"
            }
        };

        _apiSetup.UpdateConnectionInfo(connectionInfo);
        _coreApi = new CoreAPIClient(_apiSetup);
    }

    #endregion

    [HttpGet("/nlobby/visitor/get")]
    public async Task<IActionResult> VisitorGet()
    {
        // 테스트
        var response = await GetAuthTokenAsync();

        if (response != null && response.Data.errorCode.Equals("0000"))
        {
            return Ok(response.Data);
        }

        return BadRequest(new { message = "Failed to get auth token" });
    }

    [HttpPost("/nlobby/visitor/create")]
    public async Task<IActionResult> VisitorCreate([FromBody] NLobbyVisitorDTO visitorDto)
    {
        try
        {
            // API 호출
            var response = await GetAuthTokenAsync();
            var token = response.Data.APIKey;

            // 기존 VisitID가 8자리, 9자리 이상인 경우 뒷번호에서 8자리, 9자리만 가져옴
            string idEighty = visitorDto.visitID.Length > 8 ? visitorDto.visitID.Substring(visitorDto.visitID.Length - 8) : visitorDto.visitID;
            string idNinety = visitorDto.visitID.Length > 9 ? visitorDto.visitID.Substring(visitorDto.visitID.Length - 9) : visitorDto.visitID;

            // idEighty와 idNinety가 각가 8자리, 9자리가 아닌 경우 앞에 0으로 패딩
            if (idEighty.Length < 8)
            {
                idEighty = idEighty.PadLeft(8, '0');
            }
            if (idNinety.Length < 9)
            {
                idNinety = idNinety.PadLeft(9, '0');
            }

            Dictionary<string, string> form = new Dictionary<string, string>
            {
                ["Sabun"] = "V" + idNinety,
                ["Name"] = visitorDto.name,
                ["PersonType"] = "0",
                ["PersonStatus"] = "0",
                ["ValidDate"] = visitorDto.endDate,
                ["CardNo"] = "90422" + idEighty,
                ["PersonUser1"] = visitorDto.qrCode
            };

            IAPIRequest request = new APIRequest
            {
                Authentication = new BearerTokenAuthentication(token),
                Body = RequestBody.CreateJson(form)
            };

            var result = await _coreApi.PostAsync<object>(SetHRPerson, request);
        }
        catch (Exception e)
        {
            return BadRequest(new { message = e.Message });
        }
        
        return Ok();
    }


    private async Task<IAPIResponse<TokenResponseModel>> GetAuthTokenAsync()
    {
        Dictionary<string, string> form = new Dictionary<string, string>
        {
            ["ID"] = S1TokenID,
            ["Email"] = S1TokenEmail
        };

        IAPIRequest request = new APIRequest
        {
            Body = RequestBody.CreateFormData(form)
        };

        return await _coreApi.PostAsync<TokenResponseModel>(GetAuthToken, request);
    }
}