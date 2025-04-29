using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;
using System.Text.Json.Serialization;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;

public class VisitListItemDTO
{
    public int Id { get; set; }
    public string Status { get; set; } = "pending";
    public string VisitorName { get; set; } = "";
    public string VisitorCompany { get; set; } = "";
    public string VisitorContact { get; set; } = "";
    public string VisitorEmail { get; set; } = "";
    public DateTime VisitStartDate { get; set; }
    public DateTime VisitEndDate { get; set; }
    public string VisitReason { get; set; } = "";
    public string VisitPurpose { get; set; } = "";
    public string PersonName { get; set; } = "";
    public string LicensePlateNumber { get; set; } = "";
    public DateTime RegisteredDate { get; set; }
}

public class VisitReserveListParam : SQLParam
{
    [DbParameter]
    public int Page { get; set; } = 1;
    [DbParameter]
    public int PageSize { get; set; } = 10;
    [DbParameter]
    public string RoleType { get; set; } = "";
    [DbParameter]
    public int PID { get; set; } = 0;
    [DbParameter]
    public int VisitantID { get; set; } = 0;
    [DbParameter]
    public string Lan { get; set; } = "ko";
}