using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.Extensions;

namespace SECUiDEA_ERP_Server.Controllers.testApi;

[ApiController]
[Route("testApi/[action]")]
[LocalHostOnly]
public class HomeController : Controller
{
    [HttpGet]
    public IActionResult Data()
    {
        var data = new
        {
            Title = "SECUiDEA_ERP_Server.Controllers.Home",
            Datas = new[]
            {
                new { Message = "Hello, World!"},
            }
        };
        
        return Ok(data);
    }
}