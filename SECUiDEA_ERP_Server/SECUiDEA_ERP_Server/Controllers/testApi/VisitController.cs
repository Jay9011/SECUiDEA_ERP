using Microsoft.AspNetCore.Mvc;

namespace SECUiDEA_ERP_Server.Controllers.testApi;

[ApiController]
[Route("testApi/[controller]/[action]")]
public class VisitController : Controller
{
    [HttpGet]
    public IActionResult Data()
    {
        var data = new
        {
            Title = "SECUiDEA_ERP_Server.Controllers.VisitReserve",
            Datas = new[]
            {
                new { Name = "홍길동", Age = 25, InsertDate = DateTime.Now },
                new { Name = "김철수", Age = 27, InsertDate = DateTime.Now }
            }
        };

        return Ok(data);
    }
}