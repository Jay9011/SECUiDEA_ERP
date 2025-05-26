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
        private readonly Dictionary<string, string>? _requiredClaims;

        public ApiKeyAuthAttribute(string issuer)
        {
            _issuer = issuer;
        }

        /// <summary>
        /// 특정 Claim을 요구하는 API 키 인증 어트리뷰트
        /// </summary>
        /// <param name="issuer">발급자</param>
        /// <param name="requiredClaims">필수 Claim 딕셔너리 (ClaimType, ExpectedValue)</param>
        public ApiKeyAuthAttribute(string issuer, Dictionary<string, string> requiredClaims) : this(issuer)
        {
            _requiredClaims = requiredClaims;
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

            // 필수 Claim 검증
            if (_requiredClaims != null)
            {
                foreach (var requiredClaim in _requiredClaims)
                {
                    var claimValue = principal.FindFirstValue(requiredClaim.Key);
                    if (string.IsNullOrEmpty(claimValue) || claimValue != requiredClaim.Value)
                    {
                        context.Result = new UnauthorizedObjectResult($"필수 권한이 부족합니다: {requiredClaim.Key}");
                        return;
                    }
                }
            }

            // API 키 ID와 서비스명 추출
            var apiKeyId = principal.FindFirstValue(ClaimTypes.Authentication);
            var service = principal.FindFirstValue(ClaimTypes.AuthenticationMethod);

            // 요청 컨텍스트에 API 키 정보 추가
            context.HttpContext.Items[ClaimTypes.Authentication] = apiKeyId;
            context.HttpContext.Items[ClaimTypes.AuthenticationMethod] = service;

            // 모든 추가 Claim을 HttpContext에 저장
            foreach (var claim in principal.Claims)
            {
                // 이미 저장된 기본 Claim들은 제외
                if (claim.Type != ClaimTypes.Authentication && claim.Type != ClaimTypes.AuthenticationMethod)
                {
                    context.HttpContext.Items[$"ApiClaim_{claim.Type}"] = claim.Value;
                }
            }

            base.OnActionExecuting(context);
        }
    }

    /// <summary>
    /// 특정 Claim 값을 요구하는 API 키 인증 어트리뷰트
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class ApiKeyAuthWithClaimAttribute : ApiKeyAuthAttribute
    {
        /// <summary>
        /// 단일 Claim을 요구하는 생성자
        /// </summary>
        /// <param name="issuer">발급자</param>
        /// <param name="claimType">요구할 Claim 타입</param>
        /// <param name="claimValue">요구할 Claim 값</param>
        public ApiKeyAuthWithClaimAttribute(string issuer, string claimType, string claimValue) 
            : base(issuer, new Dictionary<string, string> { { claimType, claimValue } })
        {
        }
    }
}
