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

public class VisitCarResponseModel
{
    public List<VisitCar>? List { get; set; }
    public int TotalCount { get; set; }
    public int CurrentPage { get; set; }
}

public class VisitCar
{
    public int VisitCarSeq { get; set; }
    public string CarNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Dong { get; set; }
    public string? Hosu { get; set; }
    public string? Memo { get; set; }
    public bool Auth { get; set; }
}