using CoreDAL.Configuration;
using CoreDAL.Configuration.Interface;
using SECUiDEA_ERP_Server.Models.ControllerModels.Private;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Models.DBServices;

public class DBSetupService : IDBSetupService
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbSetupContainer;

    public DBSetupService(IDatabaseSetupContainer dbSetupContainer)
    {
        _dbSetupContainer = dbSetupContainer;
    }

    #endregion
    
    public async Task<BoolResultModel> SaveSingleSetupAsync(DBSetupViewModel setting)
    {
        try
        {
            var setup = _dbSetupContainer.Setups[setting.sectionName];
            var connectionInfo = DbConnectionFactory.CreateConnectionInfo(
                setup.DatabaseType,
                setting.connectionSettings);
    
            if (!connectionInfo.Validate(out string errorMessage))
            {
                return BoolResultModel.Fail(errorMessage);
            }
    
            _dbSetupContainer.UpdateSetup(setting.sectionName, connectionInfo);

            return BoolResultModel.Success("response:기본.{{what}} 설정이 성공적으로 저장되었습니다.",
                new Dictionary<string, object>
                {
                    { "what", setting.sectionName }
                });
        }
        catch (Exception e)
        {
            return BoolResultModel.Fail(e.Message);
        }
    }

    public async Task<BoolResultModel> SaveMultiSetupAsync(List<DBSetupViewModel> settings)
    {
        try
        {
            foreach (var setting in settings)
            {
                var result = await SaveSingleSetupAsync(setting);
                if (!result.IsSuccess)
                {
                    return result;
                }
            }

            return BoolResultModel.Success("response:기본.{{what}} 설정이 성공적으로 저장되었습니다.",
                new Dictionary<string, object>
                {
                    { "what", "DB.데이터베이스" }
                });
        }
        catch (Exception e)
        {
            return BoolResultModel.Fail(e.Message);
        }
    }

    public async Task<BoolResultModel> TestConnectionAsync(DBSetupViewModel setting)
    {
        if (setting == null)
        {
            return BoolResultModel.Fail("response:기본.{{what}}가 잘못되었습니다.",
                new Dictionary<string, object>
                {
                    { "what", "기본.요청 파라미터" }
                });
        }

        var connectionInfo = setting.ConnectionInfo;
        if (!connectionInfo.Validate(out string errorMessage))
        {
            return BoolResultModel.Fail(errorMessage);
        }

        var result = await DbDalFactory.CreateCoreDal(setting.databaseType).TestConnectionAsync(connectionInfo.ToConnectionString());

        if (result.IsSuccess)
        {
            return BoolResultModel.Success(result.Message);
        }

        return BoolResultModel.Fail(result.Message);
    }

    public List<DBSetupViewModel> GetAllSetups()
    {
        return _dbSetupContainer.Setups.Select(setup => new DBSetupViewModel
        {
            sectionName = setup.Key,
            databaseType = setup.Value.DatabaseType,
            connectionSettings = setup.Value.GetConnectionInfo().ToSettings()
        }).ToList();
    }
}