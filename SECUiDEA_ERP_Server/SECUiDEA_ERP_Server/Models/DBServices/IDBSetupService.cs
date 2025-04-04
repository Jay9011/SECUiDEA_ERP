using SECUiDEA_ERP_Server.Models.ControllerModels.Private;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Models.DBServices;

public interface IDBSetupService
{
    /// <summary>
    /// 단일 DB 설정을 저장
    /// </summary>
    /// <param name="setting"></param>
    /// <returns></returns>
    Task<BoolResultModel> SaveSingleSetupAsync(DBSetupViewModel setting);
    /// <summary>
    /// 다중 DB 설정을 저장
    /// </summary>
    /// <param name="settings"></param>
    /// <returns></returns>
    Task<BoolResultModel> SaveMultiSetupAsync(List<DBSetupViewModel> settings);
    /// <summary>
    /// 연결 테스트
    /// </summary>
    /// <param name="setting"></param>
    /// <returns></returns>
    Task<BoolResultModel> TestConnectionAsync(DBSetupViewModel setting);
    /// <summary>
    /// 모든 DB 설정을 가져옴
    /// </summary>
    /// <returns></returns>
    List<DBSetupViewModel> GetAllSetups();
}