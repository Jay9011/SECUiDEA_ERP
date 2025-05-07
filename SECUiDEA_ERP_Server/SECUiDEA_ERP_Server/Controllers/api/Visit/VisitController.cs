using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SECUiDEA_ERP_Server.Models.AuthUser;
using System.Security.Claims;
using AligoService;
using AligoService.Interface;
using AligoService.Model.Messages;
using SECUiDEA_ERP_Server.Controllers.BaseControllers;
using CoreDAL.Configuration.Interface;
using CoreDAL.ORM.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.api.Visit;
using SECUiDEA_ERP_Server.Models.ResultModels;
using SECUiDEA_ERP_Server.Models.Authentication;

namespace SECUiDEA_ERP_Server.Controllers.api.Visit;

[Route("api/[controller]/[action]")]
public partial class VisitController : JwtController
{
    #region 의존 주입

    private readonly IDatabaseSetupContainer _dbContainer;
    private readonly IDatabaseSetup _s1Access;
    private readonly IDatabaseSetup _secuidea;

    public VisitController(IDatabaseSetupContainer dbContainer, JwtService jwtService) : base(jwtService)
    {
        _dbContainer = dbContainer;

        _s1Access = _dbContainer.GetSetup(StringClass.S1Access);
        _secuidea = _dbContainer.GetSetup(StringClass.SECUIDEA);
    }

    #endregion

    public async Task<IActionResult> VisitReason([FromQuery] string lan)
    {
        // 유효성 검사
        if (string.IsNullOrEmpty(lan))
        {
            lan = "ko"; // 기본값을 한국어로 설정
        }
        else if (lan != "ko" && lan != "en")
        {
            lan = "ko"; // 지원하지 않는 언어는 기본값으로 설정
        }

        var param = new Dictionary<string, object>
        {
            { "Lan", lan }
        };

        var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_VisitReasonSEL", param);
        if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
        {
            var reasonList = result.DataSet.Tables[0].ToObject<VisitReasonDTO>();

            return Ok(BoolResultModel.Success("", new Dictionary<string, object>
            {
                { "reasons", reasonList }
            }));
        }

        return Ok(BoolResultModel.Success("", new Dictionary<string, object>
        {
            { "reasons", new List<VisitReasonDTO>() }
        }));
    }

    public async Task<IActionResult> EmployeeByName([FromQuery] string name)
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
                { "employees", employeeList }
            }));
        }

        return Ok(BoolResultModel.Fail("data not found", new Dictionary<string, object>
        {
            { "employees", new List<EmployeeDTO>() }
        }));
    }

    [HttpPost]
    public async Task<IActionResult> VisitReserve([FromBody] VisitReserveDTO visitReserveDTO)
    {
        try
        {
            // 유효성 검사
            if (visitReserveDTO == null || visitReserveDTO.EmployeePid == 0)
            {
                return BadRequest("Invalid visit reserve data.");
            }

            // 방문 시간 유효성 검사
            DateTime visitStartDate;
            DateTime visitEndDate;
            string strVisitSDate = visitReserveDTO.VisitDate + " " + visitReserveDTO.VisitTime;
            string strVisitEDate = visitReserveDTO.VisitEndDate + " " + visitReserveDTO.VisitEndTime;
            if (!DateTime.TryParse(strVisitSDate, out visitStartDate)
                || !DateTime.TryParse(strVisitEDate, out visitEndDate)
                || visitStartDate >= visitEndDate
               )
            {
                return BadRequest("Invalid visit date format.");
            }

            var param = new SECUiDEA_VisitReserveParam
            {
                PID = visitReserveDTO.EmployeePid,
                VisitantName = visitReserveDTO.VisitorName,
                VisitantCompany = visitReserveDTO.VisitorCompany,
                Mobile = visitReserveDTO.VisitorContact,
                Email = visitReserveDTO.VisitorEmail,
                VisitReasonID = visitReserveDTO.VisitReasonId,
                VisitReasonText = visitReserveDTO.VisitPurpose,
                VisitSDate = visitStartDate,
                VisitEDate = visitEndDate,
                LicensePlateNumber = visitReserveDTO.VisitorCarNumber,
            };

            var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_VisitReserve", param);
            if (result.IsSuccess && result.ReturnValue == 1)
            {
                // 결과에서 방문 정보 조회
                int visitantId = 0;
                int visitReserveId = 0;
                int visitReserveVisitantId = 0;
                string? EmployeePhone = "";

                var dr = result.DataSet?.Tables[0].Rows[0];
                visitantId = dr.Field<int>("VisitantID");
                visitReserveId = dr.Field<int>("VisitReserveID");
                visitReserveVisitantId = dr.Field<int>("VisitReserveVisitantID");
                EmployeePhone = dr.Field<string>("EmployeePhone");

                return Ok(BoolResultModel.Success("Visit reserved successfully.", new Dictionary<string, object>
                {
                    { "visitantId", visitantId },
                    { "visitReserveId", visitReserveId },
                    { "visitReserveVisitantId", visitReserveVisitantId },
                    { "EmployeePhone", EmployeePhone ?? "" },
                    { "ApiKey", _jwtService.GenerateApiKeyToken(StringClass.Issuer_Kakao, StringClass.SECUIDEA, "VisitReserve")}
                }));
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        return BadRequest(BoolResultModel.Fail("Failed to reserve visit."));
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetEmployeeVisitInfo()
    {
        // 사용자 ID 가져오기
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // 사용자 권한 가져오기
        var userRoleClaimValue = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(userRoleClaimValue) ||
            !Enum.TryParse<S1AuthType>(userRoleClaimValue, out var userRole))
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

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> VisitReserveList([FromQuery] int page, int limit)
    {
        // 사용자 ID 가져오기
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // 사용자 권한 가져오기
        var userRoleClaimValue = User.FindFirstValue(ClaimTypes.Role);

        if (string.IsNullOrEmpty(userRoleClaimValue) ||
            !Enum.TryParse<S1AuthType>(userRoleClaimValue, out var userRole))
        {
            return Unauthorized(new { message = "Invalid user role" });
        }

        var seq = User.FindFirstValue(ClaimTypes.Sid);
        int seqID = 0;
        if (string.IsNullOrEmpty(seq) || !int.TryParse(seq, out seqID))
        {
            return BadRequest(new { message = "Invalid user ID" });
        }

        if (userRole == S1AuthType.Guest
            || userRole == S1AuthType.Employee)
        {
            var param = new VisitReserveListParam
            {
                Page = page,
                PageSize = limit,
                RoleType = userRole.ToString(),
                PID = seqID,
                VisitantID = seqID,
                Lan = "ko"
            };

            var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_VisitReserveListSEL", param);
            if (result.IsSuccess)
            {
                var list = result.DataSet.Tables[0].ToObject<VisitListItemDTO>();

                return Ok(BoolResultModel.Success("", new Dictionary<string, object>
                {
                    { "data", list }
                }));
            }
        }

        return BadRequest(BoolResultModel.Fail("Failed to retrieve visit reserve list."));
    }

    [Authorize]
    [HttpPut]
    public async Task<IActionResult> VisitReserveStatus([FromBody] VisitStatusDTO data)
    {
        try
        {
            // 사용자 ID 가져오기
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 사용자 권한 가져오기
            var userRoleClaimValue = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userRoleClaimValue) ||
                !Enum.TryParse<S1AuthType>(userRoleClaimValue, out var userRole))
            {
                return Unauthorized(new { message = "Invalid user role" });
            }

            // Employee 이상 권한 체크
            if (userRole < S1AuthType.Employee)
            {
                return Forbid();
            }

            // 유효성 검사
            if (data.VisitId == 0 || string.IsNullOrEmpty(data.Status))
            {
                return BadRequest("Visit ID and status cannot be null or empty.");
            }

            // 현재 상태 변화는 "approved"만 가능
            if (!data.Status.Equals("approved"))
            {
                return BadRequest("Invalid status change. Only 'approved' is allowed.");
            }

            // Employee Seq 가져오기
            var seq = User.FindFirstValue(ClaimTypes.Sid);
            int seqID = 0;
            if (string.IsNullOrEmpty(seq) || !int.TryParse(seq, out seqID))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var param = new SECUiDEA_VisitReserveParam
            {
                Type = "approve",
                VisitReserveInputId = data.VisitId,
                VisitStatus = data.Status,
                PID = seqID
            };

            var result = await _s1Access.DAL.ExecuteProcedureAsync(_s1Access, "SECUiDEA_VisitReserve", param);
            if (result.IsSuccess && result.DataSet?.Tables.Count > 0 && result.DataSet.Tables[0].Rows.Count > 0)
            {
                if (result.IsSuccess && result.ReturnValue == 1)
                {
                    // 결과에서 방문 정보 조회
                    // Table[0]은 Visitant 정보
                    var visitants = result.DataSet.Tables[0].ToObject<VisitantParam>();

                    // Table[1]은 VisitReserve 정보
                    var visitReserves = result.DataSet.Tables[1].ToObject<VisitReserveParam>();

                    // Table[2]는 VisitReserveVisitant 정보
                    var visitReserveVisitants = result.DataSet.Tables[2].ToObject<VisitReserveVisitantParam>();

                    return Ok(BoolResultModel.Success("Visit reserved successfully.", new Dictionary<string, object>
                    {
                        { "visitants", visitants },
                        { "visitReserves", visitReserves },
                        { "visitReserveVisitants", visitReserveVisitants },
                        { "ApiKey", _jwtService.GenerateApiKeyToken(StringClass.Issuer_Kakao, StringClass.SECUIDEA, "VisitReserveStatus")}
                    }));
                }
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        return BadRequest("Invalid visit ID or status.");
    }
}