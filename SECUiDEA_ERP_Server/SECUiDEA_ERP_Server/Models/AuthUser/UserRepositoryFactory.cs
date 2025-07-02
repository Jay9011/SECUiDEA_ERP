using CoreDAL.Configuration.Interface;
using CryptoManager;
using SECUiDEA_ERP_Server.Controllers.api.Login;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.AuthUser;

public class UserRepositoryFactory
{
    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly ICryptoManager _cryptoSha512;

    public UserRepositoryFactory(
        IDatabaseSetupContainer dbContainer, 
        [FromKeyedServices(StringClass.CryptoS1Sha512)] ICryptoManager cryptoSha512)
    {
        _dbContainer = dbContainer;
        _cryptoSha512 = cryptoSha512;
    }

    public IUserRepository GetRepository(string provider)
    {
        switch (provider)
        {
            case StringClass.S1Access:
                return new S1UserRepository(_dbContainer, _cryptoSha512);
            default:
                throw new NotSupportedException($"Provider '{provider}' is not supported.");
        }
    }
}