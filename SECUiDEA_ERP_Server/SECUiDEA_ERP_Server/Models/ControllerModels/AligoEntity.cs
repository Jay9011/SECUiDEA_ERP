namespace SECUiDEA_ERP_Server.Models.ControllerModels;

public class AligoAcountDTO
{
    public string APIKey { get; set; }
    public string UserID { get; set; }
    public string SenderPhone { get; set; }
    public string SenderName { get; set; }
    public string Url { get; set; }
}

public class AligoTemplateDTO
{
    public int UID { get; set; }
    public string Gubun { get; set; }
    public string ChannelName { get; set; }
    public string SenderKey { get; set; }
    public string TPL_CODE { get; set; }
    public string TPL_INTRO { get; set; }
    public string Path { get; set; }
}