using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace SECUiDEA_ERP_Server.Controllers;

public class VisitController : Controller
{
    #region 의존 주입

    private readonly IWebHostEnvironment _hostingEnvironment;

    #endregion
    
    public VisitController(IWebHostEnvironment hostingEnvironment)
    {
        #region 의존 주입

        _hostingEnvironment = hostingEnvironment;

        #endregion

    }
    
    public IActionResult Index()
    {
        return File("~/visit/index.html", "text/html");
    }
}