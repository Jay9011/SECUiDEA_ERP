using CoreDAL.Configuration.Interface;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Account;

public class AccountService : IDisposable
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly IDatabaseSetup _setup;

    #endregion
    
    #region 인증번호 관리 멤버

    private readonly Timer _certCleanupTimer;

    #endregion
    
    public AccountService(IDatabaseSetupContainer dbContainer)
    {
        #region 의존 주입

        _dbContainer = dbContainer;
        _setup = _dbContainer.GetSetup(StringClass.SECUIDEA);

        #endregion
        
        #region 인증번호 관리

        _certCleanupTimer = new Timer(CertCleanupCallback, null, TimeSpan.Zero, TimeSpan.FromMinutes(5));

        #endregion
        
    }

    #region 인증번호 관리

    private void CertCleanupCallback(object state)
    {
        _ = Task.Run(async () => // 비동기 정리 작업
        {
            try
            {
                await CleanupExpiredCertsAsync();
            }
            catch (Exception ex)
            {
                // 예외 처리 로직 필요
            }
        });
    }
    
    private async Task CleanupExpiredCertsAsync()
    {
        try
        {
            await _setup.DAL.ExecuteProcedureAsync(_setup, AccountString.CleanupExpiredCert);
        }
        catch (Exception e)
        {
            
        }
    }

    #endregion
    
    public void Dispose()
    {
        _certCleanupTimer?.Dispose();
    }
}