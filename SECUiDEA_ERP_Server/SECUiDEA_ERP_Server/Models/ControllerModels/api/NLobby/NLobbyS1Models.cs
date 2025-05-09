namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.NLobby;

public class TokenResponseModel
{
    public string errorCode { get; set; }
    public string APIKey { get; set; }
}

public class S1ResponseModel
{
    public string errorCode { get; set; }
}

public class S1ResponseCountModel : S1ResponseModel
{
    public int Total { get; set; }
    public int Count { get; set; }
}

public class S1ResponseListModel : S1ResponseCountModel
{
    public List<NLobbyVisitorDTO> List { get; set; }
}

public class S1SetHRPersonResponseModel
{
    public string Sabun { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}