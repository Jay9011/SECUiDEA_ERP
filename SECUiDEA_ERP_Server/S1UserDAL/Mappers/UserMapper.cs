using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Threading.Tasks;
using CoreDAL.Configuration.Interface;
using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;
using CoreDAL.ORM.Interfaces;
using S1UserDAL.Entities;
using UserDALInterface.Entities;
using UserDALInterface.Mappers;

namespace S1UserDAL.Mappers
{
    public class UserMapper : IUserMapper
    {
        #region 의존 주입

        private readonly IDatabaseSetup _db;

        public UserMapper(IDatabaseSetup databaseSetup)
        {
            _db = databaseSetup;
        }

        #endregion

        public async Task<IUserEntity> GetUserByIdAsync(ISQLParam param = null)
        {
            try
            {
                SQLResult result = await _db.DAL.ExecuteProcedureAsync(_db, "WEB_FRONT_USER_SEL", param);

                if (!result.IsSuccess || result.DataSet == null || result.DataSet.Tables.Count == 0)
                {
                    return null;
                }

                if (result.DataSet.Tables[0].Rows.Count > 0)
                {
                    DataRow row = result.DataSet.Tables[0].Rows[0];

                    return row.ToObject<UserTable>();
                }

            }
            catch (Exception e)
            {
                throw;
            }

            return null;
        }
    }
}
