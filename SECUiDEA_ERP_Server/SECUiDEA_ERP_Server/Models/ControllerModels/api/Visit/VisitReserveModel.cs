using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;

public class VisitReasonDTO
{
    public int VisitReasonID { get; set; } = 0;
    public string VisitReasonName { get; set; } = string.Empty;
}

public class VisitorDTO
{
    public string VisitorName { get; set; } = string.Empty;
    public string VisitorYMD { get; set; } = string.Empty;
    public string VisitorContact { get; set; } = string.Empty;
}

public class VisitReserveDTO
{
    // 접견인 정보
    public int EmployeePid { get; set; } = 0;
    public string EmployeeName { get; set; } = string.Empty;
    // 방문자 정보
    public string VisitorName { get; set; } = string.Empty;
    public string VisitorCompany { get; set; } = string.Empty;
    public string VisitorContact { get; set; } = string.Empty;
    public string VisitorEmail { get; set; } = string.Empty;
    public int VisitReasonId { get; set; } = 0;
    public string VisitPurpose { get; set; } = string.Empty;
    public string VisitDate { get; set; } = string.Empty;
    public string VisitTime { get; set; } = string.Empty;
    public string VisitEndDate { get; set; } = string.Empty;
    public string VisitEndTime { get; set; } = string.Empty;
    public string VisitorCarNumber { get; set; } = string.Empty;
}

public class VisitantParam : SQLParam
{
    [DbParameter]
    public int VisitantID { get; set; } = 0;
    [DbParameter]
    public string VisitantName { get; set; } = string.Empty;
    [DbParameter]
    public string VisitantYMD { get; set; } = string.Empty; // yyyyMMdd (DB 쿼리 사용해야 함)
    [DbParameter]
    public string VisitantCompany { get; set; } = string.Empty;
    [DbParameter]
    public string Address { get; set; } = string.Empty;
    [DbParameter]
    public string OfficeTel { get; set; } = string.Empty;
    [DbParameter]
    public string Mobile { get; set; } = string.Empty;
    [DbParameter]
    public int Agreement { get; set; } = 0;
    [DbParameter]
    public DateTime AgreementDate { get; set; } = DateTime.MinValue;
}

public class VisitReserveParam : SQLParam
{
    [DbParameter]
    public int VisitID { get; set; } = 0;
    [DbParameter]
    public int PID { get; set; } = 0;
    [DbParameter]
    public int VisitObject { get; set; } = 0;
    [DbParameter]
    public int RegisterPID { get; set; } = 0;
    [DbParameter]
    public DateTime VisitSDate { get; set; } = DateTime.MinValue;
    [DbParameter]
    public DateTime VisitEDate { get; set; } = DateTime.MinValue;
    [DbParameter]
    public int VisitStatusID { get; set; } = 0;
    [DbParameter]
    public int VisitReasonID { get; set; } = 0;
    [DbParameter]
    public string VisitReasonText { get; set; } = string.Empty;
    [DbParameter]
    public int VisitProtocol { get; set; } = 0;
    [DbParameter]
    public int VisitAssignPID { get; set; } = 0;
}

public class VisitReserveVisitantParam : SQLParam
{
    [DbParameter]
    public int VisitReserveVisitantID { get; set; } = 0;
    [DbParameter]
    public int VisitID { get; set; } = 0;
    [DbParameter]
    public int VisitantID { get; set; } = 0;
    [DbParameter]
    public int PID { get; set; } = 0;
    [DbParameter]
    public DateTime VisitInTime { get; set; } = DateTime.MinValue;
    [DbParameter]
    public string LicensePlateNumber { get; set; } = string.Empty;
    [DbParameter]
    public int VehicleTypeID { get; set; } = 0;
    [DbParameter]
    public int VisitStatusID { get; set; } = 0;
    [DbParameter]
    public int CardID { get; set; } = 0;
}

public class SECUiDEA_VisitReserveParam : SQLParam
{
    [DbParameter]
    public int PID { get; set; } = 0;
    [DbParameter]
    public string VisitantName { get; set; } = string.Empty;
    [DbParameter]
    public string VisitantCompany { get; set; } = string.Empty;
    [DbParameter]
    public string Mobile { get; set; } = string.Empty;
    [DbParameter]
    public string Email { get; set; } = string.Empty;
    [DbParameter]
    public int VisitReasonID { get; set; } = 0;
    [DbParameter]
    public string VisitReasonText { get; set; } = string.Empty;
    [DbParameter]
    public DateTime VisitSDate { get; set; } = DateTime.MinValue;
    [DbParameter]
    public DateTime VisitEDate { get; set; } = DateTime.MinValue;
    [DbParameter]
    public string LicensePlateNumber { get; set; } = string.Empty;
}

public class VisitorEducationParam : SQLParam
{
    [DbParameter]
    public int VisitantID { get; set; } = 0;
    [DbParameter]
    public bool Education { get; set; } = false;
    [DbParameter]
    public DateTime EducationDate { get; set; } = DateTime.MinValue;
}