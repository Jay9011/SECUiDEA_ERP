using Newtonsoft.Json;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Login.S1AuthModel;

public class S1UserDTO
{
    public string Id { get; set; }

    public string Password { get; set; }

    public bool rememberMe { get; set; } = false;

    public DateTime LastLogin { get; set; }
    
}