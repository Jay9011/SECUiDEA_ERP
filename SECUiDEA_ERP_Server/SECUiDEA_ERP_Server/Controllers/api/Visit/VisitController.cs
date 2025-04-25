using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SECUiDEA_ERP_Server.Models.AuthUser;
using System.Security.Claims;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;

namespace SECUiDEA_ERP_Server.Controllers.api.Visit;

[Route("api/[controller]/[action]")]
public class VisitController : BaseController
{
    public IActionResult Test()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Ok(new
        {
            userId = userId,
            message = "Employee access granted",
            timestamp = DateTime.Now
        });
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetEmployeeVisitInfo()
    {
        // 사용자 ID 가져오기
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        // 사용자 권한 가져오기
        var userRoleClaimValue = User.FindFirstValue(ClaimTypes.Role);
        
        if (string.IsNullOrEmpty(userRoleClaimValue) || !Enum.TryParse<S1AuthType>(userRoleClaimValue, out var userRole))
        {
            return Unauthorized(new { message = "Invalid user role" });
        }

        // Employee 이상 권한 체크
        if (userRole < S1AuthType.Employee)
        {
            return Forbid();
        }

        // 여기서 Employee 이상 권한이 있는 사용자에게 필요한 데이터를 반환
        return Ok(new 
        { 
            userId = userId,
            userRole = userRole.ToString(),
            message = "Employee access granted",
            timestamp = DateTime.Now
        });
    }
}