using System.Security.Claims;

namespace SECUiDEA_ERP_Server.Controllers.Extensions
{
    /// <summary>
    /// HttpContext 확장 메서드
    /// </summary>
    public static class HttpContextExtensions
    {
        /// <summary>
        /// API 키 토큰에서 특정 Claim 값을 가져오는 메서드
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <param name="claimType">가져올 Claim 타입</param>
        /// <returns>Claim 값 (없으면 null)</returns>
        public static string? GetApiClaim(this HttpContext context, string claimType)
        {
            var key = $"ApiClaim_{claimType}";
            return context.Items.TryGetValue(key, out var value) ? value?.ToString() : null;
        }

        /// <summary>
        /// API 키 ID를 가져오는 메서드
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <returns>API 키 ID</returns>
        public static string? GetApiKeyId(this HttpContext context)
        {
            return context.Items.TryGetValue(ClaimTypes.Authentication, out var value) ? value?.ToString() : null;
        }

        /// <summary>
        /// API 서비스명을 가져오는 메서드
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <returns>API 서비스명</returns>
        public static string? GetApiServiceName(this HttpContext context)
        {
            return context.Items.TryGetValue(ClaimTypes.AuthenticationMethod, out var value) ? value?.ToString() : null;
        }

        /// <summary>
        /// 모든 API Claim을 Dictionary로 가져오는 메서드
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <returns>API Claim Dictionary</returns>
        public static Dictionary<string, string> GetAllApiClaims(this HttpContext context)
        {
            var claims = new Dictionary<string, string>();
            
            foreach (var item in context.Items)
            {
                if (item.Key is string key && key.StartsWith("ApiClaim_") && item.Value != null)
                {
                    var claimType = key.Substring("ApiClaim_".Length);
                    claims[claimType] = item.Value.ToString()!;
                }
            }

            return claims;
        }

        /// <summary>
        /// 특정 Claim이 존재하는지 확인하는 메서드
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <param name="claimType">확인할 Claim 타입</param>
        /// <returns>존재 여부</returns>
        public static bool HasApiClaim(this HttpContext context, string claimType)
        {
            var key = $"ApiClaim_{claimType}";
            return context.Items.ContainsKey(key);
        }

        /// <summary>
        /// 특정 Claim이 특정 값을 가지는지 확인하는 메서드
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <param name="claimType">확인할 Claim 타입</param>
        /// <param name="expectedValue">기대하는 값</param>
        /// <returns>값 일치 여부</returns>
        public static bool HasApiClaimValue(this HttpContext context, string claimType, string expectedValue)
        {
            var actualValue = context.GetApiClaim(claimType);
            return actualValue == expectedValue;
        }
    }
} 