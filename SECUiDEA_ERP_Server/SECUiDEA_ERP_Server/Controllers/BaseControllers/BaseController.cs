using AligoService.ImplementClasses;
using AligoService.Interface;
using CoreDAL.Configuration.Interface;
using CoreDAL.ORM.Extensions;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Models.Authentication;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels;

namespace SECUiDEA_ERP_Server.Controllers.BaseControllers;

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

    /// <summary>
    /// 브라우저 클라이언트인지 확인
    /// </summary>
    /// <param name="request"></param>
    /// <returns></returns>
    protected bool IsBrowserClient(HttpRequest request)
    {
        var userAgent = request.Headers["User-Agent"].ToString().ToLower();

        return !string.IsNullOrEmpty(userAgent)
               && (userAgent.Contains("mozilla")
                   || userAgent.Contains("chrome")
                   || userAgent.Contains("safari")
                   || userAgent.Contains("edge")
                   || userAgent.Contains("firefox")
               );
    }
    
    /// <summary>
    /// Request Body를 Dictionary 형태로 읽음
    /// </summary>
    /// <returns></returns>
    protected async Task<Dictionary<string, object>> GetRequestBodyAsync()
    {
        try
        {
            if (Request.Body == null || !Request.Body.CanRead)
                return null;

            Request.Body.Position = 0;

            // 요청 본문 읽기
            using (var reader = new StreamReader(Request.Body, leaveOpen: true))
            {
                var body = await reader.ReadToEndAsync();

                Request.Body.Position = 0;

                if (string.IsNullOrEmpty(body))
                    return null;

                return System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(body);
            }
        }
        catch
        {
            Request.Body.Position = 0;
            return null;
        }
    }

    /// <summary>
    /// Aligo 계정 정보를 DB에서 조회
    /// </summary>
    /// <param name="_database"></param>
    /// <returns></returns>
    protected async Task<AligoAcountDTO> GetAligoAccountInfo(IDatabaseSetup _database)
    {
        var param = new Dictionary<string, object>()
        {
            { "Type", "A" }
        };

        var result = await _database.DAL.ExecuteProcedureAsync(_database, "SECUiDEA_AligoAccount", param);

        if (result.IsSuccess && result is { ReturnValue: 1, DataSet.Tables.Count: > 0 } && result.DataSet.Tables[0].Rows.Count > 0)
        {
            return result.DataSet.Tables[0].Rows[0].ToObject<AligoAcountDTO>();
        }

        return null;
    }

    protected async Task<AligoTemplateDTO> GetAligoTemplateInfo(IDatabaseSetup _database, string gubun)
    {
        var param = new Dictionary<string, object>()
        {
            { "Type", "T" },
            { "Gubun", gubun }
        };
        var result = await _database.DAL.ExecuteProcedureAsync(_database, "SECUiDEA_AligoAccount", param);
        if (result.IsSuccess && result is { ReturnValue: 1, DataSet.Tables.Count: > 0 } && result.DataSet.Tables[0].Rows.Count > 0)
        {
            return result.DataSet.Tables[0].Rows[0].ToObject<AligoTemplateDTO>();
        }

        return null;
    }
}