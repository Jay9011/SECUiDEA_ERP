using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Login.S1AuthModel;

public class S1UserParams : SQLParam
{
    [DbParameter]
    public string ID { get; set; }

    [DbParameter]
    public string Password { get; set; }
}