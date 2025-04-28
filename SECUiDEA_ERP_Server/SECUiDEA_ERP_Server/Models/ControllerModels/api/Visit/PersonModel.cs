using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;
using CoreDAL.ORM.Interfaces;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;

public class GetPersonModel : SQLParam
{
    [DbParameter]
    public string Type { get; set; } = string.Empty;
    [DbParameter]
    public string Name { get; set; } = string.Empty;
}

public class EmployeeDTO
{
    public int PID { get; set; }
    public string Sabun { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int PersonStatusID { get; set; }
    public string PersonStatusName { get; set; } = string.Empty;
}