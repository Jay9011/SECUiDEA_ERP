using SECUiDEA_ERP_Server.Models.CommonModels;

namespace SECUiDEA_ERP_Server.Models.Authentication;

public class KakaoJwtSettings
{
    public string Secret { get; set; }
    public string Issuer { get; set; } = StringClass.Issuer_Kakao;
    public string Audience { get; set; } = StringClass.SECUiDEA_Audience;
    public double ExpiryMinutes { get; set; } = StringClass.DefaultApiExpiryMinutes;
}