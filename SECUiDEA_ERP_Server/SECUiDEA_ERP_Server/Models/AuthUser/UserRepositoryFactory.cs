using CoreDAL.Configuration.Interface;
using SECUiDEA_ERP_Server.Controllers.api.Login;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.AuthUser;

public class UserRepositoryFactory
{
    private readonly IDatabaseSetupContainer _dbContainer;

    public UserRepositoryFactory(IDatabaseSetupContainer dbContainer)
    {
        _dbContainer = dbContainer;
    }

    public IUserRepository GetRepository(string provider)
    {
        switch (provider)
        {
            case StringClass.S1Access:
                return new S1UserRepository(_dbContainer);
            default:
                throw new NotSupportedException($"Provider '{provider}' is not supported.");
        }
    }
}