using Microsoft.AspNetCore.Mvc;

namespace SECUiDEA_ERP_Server.Controllers;

public class BaseController : Controller
{
    /// <summary>
    /// Client IP 주소를 획득
    /// </summary>
    /// <returns></returns>
    protected string GetClientIpAddress()
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;
        
        ipAddress = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["HTTP_X_FORWARDED_FOR"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["HTTP_X_REAL_IP"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["REMOTE_ADDR"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["HTTP_CLIENT_IP"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["HTTP_X_CLUSTER_CLIENT_IP"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        ipAddress = HttpContext.Request.Headers["HTTP_FORWARDED_FOR"].FirstOrDefault();

        if (!string.IsNullOrEmpty(ipAddress))
            return ipAddress;
        
        return ipAddress;
    }
}