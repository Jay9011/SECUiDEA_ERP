using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;

namespace SECUiDEA_ERP_Server.Models.Account;

public class PassCertMobileModel : SQLParam
{
    [DbParameter]
    public string Type { get; set; } = "reg";
    [DbParameter]
    public string? Mobile { get; set; }
    [DbParameter]
    public string? CertificateData { get; set; }
    [DbParameter]
    public DateTime? IssuedDate { get; set; }
    [DbParameter]
    public DateTime? ExpiredDate { get; set; }
    [DbParameter]
    public string? UpdateIp { get; set; }
}