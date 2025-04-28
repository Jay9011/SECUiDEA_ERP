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

[Route("api/[controller]/[action]")]
public class VisitController : BaseController
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly IDatabaseSetup _s1Access;

    public VisitController(IDatabaseSetupContainer dbContainer)
    {
        _dbContainer = dbContainer;

        _s1Access = _dbContainer.GetSetup(StringClass.S1Access);
    }

    #endregion

    public async Task<IActionResult> GetEmployeeByName([FromQuery] string name)
    {
        // 유효성 검사
        if (string.IsNullOrEmpty(name))
        {
            return BadRequest("Name cannot be null or empty.");
        }

        var param = new GetPersonModel
        {
            Type = "name",
            Name = name
        };

        var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_GetPerson", param);
        if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
        {
            var employeeList = result.DataSet.Tables[0].ToObject<EmployeeDTO>();

            return Ok(BoolResultModel.Success("", new Dictionary<string, object>
            {
                {"employees", employeeList}
            }));
        }

        return Ok(BoolResultModel.Fail("data not found", new Dictionary<string, object>
        {
            { "employees", new List<EmployeeDTO>() }
        }));
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetEmployeeVisitInfo()
    {
        // 사용자 ID 가져오기
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        // 사용자 권한 가져오기
        var userRoleClaimValue = User.FindFirstValue(ClaimTypes.Role);
        
        if (string.IsNullOrEmpty(userRoleClaimValue) || !Enum.TryParse<S1AuthType>(userRoleClaimValue, out var userRole))
        {
            return Unauthorized(new { message = "Invalid user role" });
        }

        // Employee 이상 권한 체크
        if (userRole < S1AuthType.Employee)
        {
            return Forbid();
        }

        // 여기서 Employee 이상 권한이 있는 사용자에게 필요한 데이터를 반환
        return Ok(new 
        { 
            userId = userId,
            userRole = userRole.ToString(),
            message = "Employee access granted",
            timestamp = DateTime.Now
        });
    }
}