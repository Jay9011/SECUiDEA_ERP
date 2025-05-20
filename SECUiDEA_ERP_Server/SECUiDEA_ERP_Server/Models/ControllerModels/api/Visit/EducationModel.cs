namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;

public class EducationDTO
{
    // 교육 이수 타입
    public int CompletionType { get; set; } = 1;
    public bool Required { get; set; } = true;
    public VisitorEducationParam EducationData { get; set; } = new VisitorEducationParam();
}