namespace SECUiDEA_ERP_Server.Models.Parking;

public class VisitCarModel
{
    public string CarNumber { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Dong { get; set; }
    public string? Hosu { get; set; }
    public string? Memo { get; set; }
}