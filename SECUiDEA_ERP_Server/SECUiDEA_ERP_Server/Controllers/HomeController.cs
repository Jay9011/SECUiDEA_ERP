using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Models;

namespace SECUiDEA_ERP_Server.Controllers;

public class HomeController : Controller
{
    public HomeController()
    {
    }

    public IActionResult Index()
    {
        return View();
    }
    
    public IActionResult Test()
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
    
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
