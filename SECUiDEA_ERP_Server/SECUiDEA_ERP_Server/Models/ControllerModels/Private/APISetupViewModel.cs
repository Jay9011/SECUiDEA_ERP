using APIClient.Configuration.Interfaces;
using APIClient.Configuration.Models;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.Private;

public class APISetupViewModel
{
    /// <summary>
    /// API 설정 섹션명
    /// </summary>
    public string SectionName { get; set; } = string.Empty;
    /// <summary>
    /// API URL
    /// </summary>
    public string BaseUrl { get; set; } = string.Empty;
    /// <summary>
    /// EndPoint 및 설정 리스트
    /// </summary>
    public Dictionary<string, string> EndPoints { get; set; } = new Dictionary<string, string>();
}