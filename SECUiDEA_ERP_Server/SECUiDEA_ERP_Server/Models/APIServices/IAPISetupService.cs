using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Models.APIServices;

public interface IAPISetupService
{
    /// <summary>
    /// 단일 API 설정 저장
    /// </summary>
    /// <param name="setting"></param>
    /// <returns></returns>
    Task<BoolResultModel> SaveSingleSetupAsync(APISetupViewModel setting);
    /// <summary>
    /// 다중 API 설정 저장
    /// </summary>
    /// <param name="settings"></param>
    /// <returns></returns>
    Task<BoolResultModel> SaveMultiSetupAsync(List<APISetupViewModel> settings);
    /// <summary>
    /// API 설정 조회
    /// </summary>
    /// <param name="setupName"></param>
    /// <returns></returns>
    APISetupViewModel? GetSetup(string setupName);
    /// <summary>
    /// 모든 API 설정 조회
    /// </summary>
    /// <returns></returns>
    List<APISetupViewModel> GetAllSetups();
    
}