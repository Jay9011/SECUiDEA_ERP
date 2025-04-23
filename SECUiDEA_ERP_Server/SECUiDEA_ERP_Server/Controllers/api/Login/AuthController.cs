using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using SECUiDEA_ERP_Server.Models.Authentication;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Login;

[Route("api/[controller]/[action]")]
public class AuthController : JwtController
{
    #region 의존 주입

    private readonly UserAuthService _authService;

    public AuthController(UserAuthService authService, JwtService jwtService) : base(jwtService)
    {
        _authService = authService;
    }

    #endregion

    [HttpPost]
    public async Task<IActionResult> RefreshToken()
    {
        // 우선, 쿠키에서 토큰 확인
        string? refreshToken = Request.Cookies[StringClass.RefreshToken];

        // 쿠키에 없으면 요청 헤더나 본문에서 확인
        if (string.IsNullOrEmpty(refreshToken) && Request.Headers.TryGetValue(StringClass.HXRefreshToken, out var headerToken))
        {
            refreshToken = headerToken;
        }
        else if (string.IsNullOrEmpty(refreshToken))
        {
            var requestBody = await GetRequestBodyAsync();
            if (requestBody != null && requestBody.TryGetValue(StringClass.RefreshToken, out var bodyToken))
            {
                refreshToken = bodyToken?.ToString();
            }
        }

        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token is required" });
        }

        string ipAddress = GetClientIpAddress();
        var tokenResponse = await _authService.RefreshTokenAsync(refreshToken, ipAddress);

        if (tokenResponse == null)
        {
            // 리프레시 토큰 쿠키 제거
            Response.Cookies.Delete(StringClass.RefreshToken);
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        // 브라우저 환경에서만 쿠키 설정
        if (IsBrowserClient(Request))
        {
            SetRefreshTokenCookie(tokenResponse.RefreshToken, false, tokenResponse.ExpiryDate);
        }

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
}