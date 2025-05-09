namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.NLobby;

public class NLobbyVisitorDTO
{
    public string visitID { get; set; } = string.Empty;
    public string name { get; set; } = string.Empty;
    public string authority { get; set; } = string.Empty;
    public string qrCode { get; set; } = string.Empty;
    public string startDate { get; set; } = string.Empty;
    public string endDate { get; set; } = string.Empty;
}

public class NLobbyVisitorDeleteDTO
{
    public string visitID { get; set; } = string.Empty;
    public string qrCode { get; set; } = string.Empty;
}