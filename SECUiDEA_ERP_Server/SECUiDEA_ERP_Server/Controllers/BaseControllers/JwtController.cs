using SECUiDEA_ERP_Server.Models.Authentication;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Controllers.BaseControllers;

public class JwtController : BaseController
{
    protected readonly JwtService _jwtService;

    public JwtController(JwtService jwtService)
    {
        _jwtService = jwtService;
    }

    /// <summary>
    /// 리프레시 토큰을 쿠키에 설정
    /// </summary>
    /// <param name="token"></param>
    protected void SetRefreshTokenCookie(string token, bool rememberMe = false, DateTime? expiryDate = null)
    {
        DateTime expires;
        if (expiryDate.HasValue)
        {
            expires = expiryDate.Value;
        }
        else
        {
            double days = rememberMe
                ? _jwtService.GetSettings.AutoLoginDays
                : _jwtService.GetSettings.RefreshTokenDays;

            expires = DateTime.Now.AddDays(days);
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = expires
        };

        Response.Cookies.Append(StringClass.RefreshToken, token, cookieOptions);
    }

}