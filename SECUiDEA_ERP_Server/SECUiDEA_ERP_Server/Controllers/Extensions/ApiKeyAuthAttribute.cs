using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SECUiDEA_ERP_Server.Models.Authentication;

namespace SECUiDEA_ERP_Server.Controllers.Extensions
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class ApiKeyAuthAttribute: ActionFilterAttribute
    {
        private readonly string _issuer;

        public ApiKeyAuthAttribute(string issuer)
        {
            _issuer = issuer;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.HttpContext.Request.Headers.TryGetValue("X-API-KEY", out var apiKeyToken))
            {
                context.Result = new UnauthorizedObjectResult("API 키가 필요합니다.");
                return;
            }

            var jwtService = context.HttpContext.RequestServices.GetRequiredService<JwtService>();
            if (!jwtService.ValidateApiKeyToken(apiKeyToken, _issuer, out var principal))
            {
                context.Result = new UnauthorizedObjectResult("유효하지 않은 API 키입니다.");
                return;
            }

            // API 키 ID와 서비스명 추출
            var apiKeyId = principal.FindFirstValue("api_key_id");
            var service = principal.FindFirstValue("service");

            // 요청 컨텍스트에 API 키 정보 추가
            context.HttpContext.Items["ApiKeyId"] = apiKeyId;
            context.HttpContext.Items["ApiService"] = service;

            base.OnActionExecuting(context);
        }
    }
}
