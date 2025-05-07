using AligoService.Model;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.Aligo;

public class SendRequestModel
{
    public string Gubun { get; set; }
    public List<ReceiverInfo> ReceiverList { get; set; }
}