using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SECUiDEA_ERP_Server.Models.AuthUser;
using System.Security.Claims;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using CoreDAL.Configuration.Interface;
using CoreDAL.ORM.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers.api.Visit;

public partial class VisitController : JwtController
{

    [HttpPost]
    public async Task<IActionResult> CheckEducation([FromBody] VisitorDTO visitor)
    {
        try
        {
            // 유효성 검사
            if (string.IsNullOrEmpty(visitor.VisitorName) || string.IsNullOrEmpty(visitor.VisitorContact))
            {
                return BadRequest(BoolResultModel.Fail("Visitor name and contact cannot be null or empty."));
            }

            var param = new VisitantParam
            {
                VisitantName = visitor.VisitorName,
                VisitantYMD = visitor.VisitorYMD,
                Mobile = visitor.VisitorContact
            };

            var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_CheckVisitant", param);
            if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
            {
                // result의 Return Value가 0이면 에러, 1이면 교육 필요, 2이면 이수 완료
                var education = result.DataSet.Tables[0].ToObject<VisitorEducationParam>();

                switch (result.ReturnValue)
                {
                    case 0:
                        return BadRequest(BoolResultModel.Fail("Error occurred while checking education.", new Dictionary<string, object>
                        {
                            {"educationData", education}
                        }));
                    case 1:
                        return Ok(BoolResultModel.Success("Education required.", new Dictionary<string, object>
                        {
                            {"required", true},
                            {"educationData", education}
                        }));
                    default:
                        return Ok(BoolResultModel.Success("", new Dictionary<string, object>
                        {
                            {"required", false},
                            {"educationData", education}
                        }));
                }
            }

        }
        catch (Exception e)
        {

        }

        return BadRequest(BoolResultModel.Fail("Failed to Check Education."));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> EducationCompletion()
    {
        try
        {
            // 사용자 ID 가져오기
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 유효성 검사
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(BoolResultModel.Fail("Invalid Access."));
            }

            var visitorSeq = User.FindFirstValue(ClaimTypes.Sid);
            var param = new Dictionary<string, object>()
            {
                { "VisitantID", visitorSeq },
                { "UpdateIP", GetClientIpAddress() }
            };
            var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_EducationREG", param);

            if (result.IsSuccess && result.ReturnValue == 1)
            {
                return Ok(BoolResultModel.Success());
            }
        }
        catch (Exception e)
        {
        }

        return BadRequest(BoolResultModel.Fail("Failed to Education Completion."));
    }
}