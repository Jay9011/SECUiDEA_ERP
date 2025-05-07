using AligoService;
using AligoService.Interface;
using AligoService.Model;
using AligoService.Model.Messages;
using AligoService.Model.Templates;
using CoreDAL.Configuration.Interface;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Controllers.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.Aligo;
using System.Security.Claims;

namespace SECUiDEA_ERP_Server.Controllers.api.Aligo;

[Route("api/[controller]/[action]")]
public class AligoController : BaseController
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly IDatabaseSetup _s1Access;
    private readonly IDatabaseSetup _secuidea;

    public AligoController(IDatabaseSetupContainer dbContainer)
    {
        _dbContainer = dbContainer;

        _s1Access = _dbContainer.GetSetup(StringClass.S1Access);
        _secuidea = _dbContainer.GetSetup(StringClass.SECUIDEA);
    }

    #endregion

    [HttpPost]
    [ApiKeyAuth(issuer: StringClass.Issuer_Kakao)]
    public async Task<IActionResult> SendRequest([FromBody] SendRequestModel request)
    {
        // API 키 인증
        var apiKeyId = HttpContext.Items[ClaimTypes.Authentication] as string;
        var serviceName = HttpContext.Items[ClaimTypes.AuthenticationMethod] as string;

        AligoAcountDTO aligoAcountDto = await GetAligoAccountInfo(_secuidea);
        AligoTemplateDTO aligoTemplateDto = await GetAligoTemplateInfo(_secuidea, request.Gubun);
        IAligoClient aligoClient = AligoClientFactory.Create(aligoAcountDto.APIKey, aligoAcountDto.UserID, aligoTemplateDto.SenderKey);

        // 템플릿 정보 조회
        var templateResult = await aligoClient.TemplateService.GetTemplatesAsync(aligoTemplateDto.TPL_CODE);
        if (templateResult.Success && templateResult.Templates.Count > 0)
        {
            var template = templateResult.Templates[0]; // 일단 템플릿은 하나만 사용한다고 가정
            var tplContent = template.Content;
            var tplName = template.Name;

            // 수신자별로 메시지 내용과 변수 세팅
            foreach (var receiver in request.ReceiverList)
            {
                receiver.Subject = tplName;
                receiver.TemplateContent = tplContent;
                receiver.FailoverSubject = tplName;
                receiver.FailoverMessage = tplContent;
                // variables는 클라이언트 측에서 세팅
            }

            // 메시지 전송 요청 생성
            var sendRequest = TemplateHelper.CreateSendRequest(
                templateCode:aligoTemplateDto.TPL_CODE,
                sender: aligoAcountDto.SenderPhone,
                receiverList: request.ReceiverList
            );

            // 메시지 전송
            aligoClient.MessageService.SendMessageAsync(sendRequest);
        }

        return Ok("Success to send message");
    }

}