using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;

public class VisitListItemDTO
{
    public int Id { get; set; }
    public string Status { get; set; } = "pending";
    public string VisitorName { get; set; } = "";
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string VisitorCompany { get; set; } = "";
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string VisitorContact { get; set; } = "";
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string VisitorEmail { get; set; } = "";
    public DateTime VisitStartDate { get; set; }
    public DateTime VisitEndDate { get; set; }
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string VisitReason { get; set; } = "";
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string VisitPurpose { get; set; } = "";
    public string PersonName { get; set; } = "";
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string LicensePlateNumber { get; set; } = "";
    public DateTime RegisteredDate { get; set; }
    public bool Education { get; set; } = false;
    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public DateTime EducationDate { get; set; } = DateTime.MinValue;
}

public class VisitStatusDTO
{
    public int VisitId { get; set; } = 0;
    public string Status { get; set; } = "pending";
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