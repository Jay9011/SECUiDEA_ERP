using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Authentication
{
    public partial class JwtService
    {
        /// <summary>
        /// API 키 토큰 생성
        /// </summary>
        /// <param name="issuer">발급 구분</param>
        /// <param name="apiKeyId">API Key</param>
        /// <param name="serviceName">발급 서비스</param>
        /// <param name="expiryOption">시간 제한</param>
        /// <returns></returns>
        public string GenerateApiKeyToken(string issuer, string apiKeyId, string serviceName, TimeSpan? expiryOption = null)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Convert.FromBase64String(_jwtSettings.Secret);

            var claims = new[]
            {
                new Claim(ClaimTypes.Authentication, apiKeyId),
                new Claim(ClaimTypes.AuthenticationMethod, serviceName)
            };

            TimeSpan expiry = expiryOption ?? TimeSpan.FromMinutes(StringClass.DefaultApiExpiryMinutes);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = StringClass.Issuer_Kakao,
                Audience = StringClass.SECUiDEA_Audience,
                Expires = DateTime.Now.Add(expiry),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), // 토큰 서명 대칭키
                    SecurityAlgorithms.HmacSha256Signature // 토큰 서명 해시 알고리즘
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// API 키 토큰 검증
        /// </summary>
        /// <param name="token">API 키 토큰</param>
        /// <param name="issuer">발급 구분</param>
        /// <param name="principal"></param>
        /// <returns></returns>
        public bool ValidateApiKeyToken(string token, string issuer, out ClaimsPrincipal principal)
        {
            principal = null;

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Convert.FromBase64String(_jwtSettings.Secret);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = StringClass.SECUiDEA_Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ClockSkew = TimeSpan.Zero
                };

                principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }
    }
}
