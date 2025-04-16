using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Login;

[Route("api/[controller]/[action]")]
public class AuthController : BaseController
{
    #region 의존 주입

    private readonly UserAuthService _authService;

    public AuthController(UserAuthService authService)
    {
        _authService = authService;
    }

    #endregion

    [HttpPost]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies[StringClass.RefreshToken];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token is missing" });
        }

        string ipAddress = GetClientIpAddress();
        var tokenResponse = await _authService.RefreshTokenAsync(refreshToken, ipAddress);

        if (tokenResponse == null)
        {
            // 리프레시 토큰 쿠키 제거
            Response.Cookies.Delete(StringClass.RefreshToken);
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        SetRefreshTokenCookie(tokenResponse.RefreshToken);

        return Ok(tokenResponse);
    }

    [HttpPost]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies[StringClass.RefreshToken];
        var accessToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(accessToken, refreshToken, GetClientIpAddress());
        }

        Response.Cookies.Delete(StringClass.RefreshToken);
        return Ok(new { message = "Logged out successfully" });
    }

    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append(StringClass.RefreshToken, token, cookieOptions);
    }
}