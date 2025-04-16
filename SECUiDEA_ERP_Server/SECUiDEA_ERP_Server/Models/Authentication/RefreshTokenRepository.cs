using CoreDAL.Configuration.Interface;
using CoreDAL.ORM.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Authentication;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;

    #endregion

    public RefreshTokenRepository(IDatabaseSetupContainer dbContainer)
    {
        #region 의존 주입

        _dbContainer = dbContainer;

        #endregion
    }

    public async Task<RefreshToken> GetByTokenAsync(string token)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var parameter = new RefreshToken
        {
            Token = token
        };

        var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, JwtProcedure.GetRefreshTokenByToken, parameter);

        if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
        {
            return result.DataSet.Tables[0].Rows[0].ToObject<RefreshToken>();
        }

        return null;
    }

    public async Task SaveTokenAsync(RefreshToken token)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, JwtProcedure.SaveRefreshToken, token);

        if (!result.IsSuccess)
        {
            throw new Exception("Failed to save refresh token.");
        }
    }

    public async Task UpdateTokenAsync(RefreshToken token)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);

        var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, JwtProcedure.UpdateRefreshToken, token);

        if (!result.IsSuccess)
        {
            throw new Exception("Failed to update refresh token.");
        }
    }

    public async Task<List<RefreshToken>> GetActiveTokensByUserIdAsync(string provider, string userId)
    {
        var dbSetup = _dbContainer.GetSetup(StringClass.JwtSetupDb);
        var parameter = new RefreshToken
        {
            Provider = provider,
            UserId = userId
        };
        var result = await dbSetup.DAL.ExecuteProcedureAsync(dbSetup, JwtProcedure.GetActiveTokensByUserId, parameter);
        if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
        {
            return result.DataSet.Tables[0].ToObject<RefreshToken>() as List<RefreshToken>;
        }

        return new List<RefreshToken>();
    }
}