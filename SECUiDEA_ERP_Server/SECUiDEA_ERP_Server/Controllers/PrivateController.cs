using CoreDAL.Configuration;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using FileIOHelper;
using Microsoft.AspNetCore.Mvc;
using SECUiDEA_ERP_Server.Controllers.Extensions;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.ControllerModels.Private;
using SECUiDEA_ERP_Server.Models.DBServices;
using SECUiDEA_ERP_Server.Models.ResultModels;

namespace SECUiDEA_ERP_Server.Controllers;

[LocalHostOnly]
public class PrivateController : Controller
{
    #region 의존 주입

    private readonly ICryptoManager _cryptoSecuidea;
    private readonly IIOHelper _ioHelper;
    private readonly IDatabaseSetupContainer _dbSetupContainer;
    private readonly IDBSetupService _dbSetupService;

    #endregion

    public PrivateController(IDatabaseSetupContainer dbSetupContainer, IDBSetupService dbSetupService, [FromKeyedServices(StringClass.IoDbSetupFile)] IIOHelper ioHelper, [FromKeyedServices(StringClass.CryptoSecuidea)] ICryptoManager cryptoSecuidea)
    {
        #region 의존 주입

        _dbSetupContainer = dbSetupContainer;
        _dbSetupService = dbSetupService;
        _ioHelper = ioHelper;
        _cryptoSecuidea = cryptoSecuidea;

        #endregion
    }

    [HttpGet]
    public IActionResult DBSetup()
    {
        // DBSetup 파일이 없는 경우 파일 생성
        try
        {
            _dbSetupService.GetAllSetups();
        }
        catch (FileNotFoundException e)
        {
            Program.SetupDbContainer(_ioHelper, _cryptoSecuidea);
        }

        var setupViewModel = _dbSetupService.GetAllSetups();
        
        return View(setupViewModel);
    }

    [HttpPost]
    public async Task<IActionResult> DBSetup(List<DBSetupViewModel> settings)
    {
        var result = await _dbSetupService.SaveMultiSetupAsync(settings);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        
        return RedirectToAction(nameof(DBSetup));
    }

    [HttpPost]
    public async Task<IActionResult> SaveSingleDBSetup([FromBody] DBSetupViewModel setting)
    {
        // 연결 테스트 후 정상적으로 연결 되어야만 저장
        var result = await _dbSetupService.TestConnectionAsync(setting);
        if (result.IsSuccess)
        {
            result = await _dbSetupService.SaveSingleSetupAsync(setting);
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> TestConnection([FromBody] DBSetupViewModel? setting)
    {
        if (setting == null)
        {
            return BadRequest(BoolResultModel.Fail("response:기본.{{what}}가 잘못되었습니다.",
                new Dictionary<string, object>
                {
                    { "what", "기본.요청 파라미터" }
                }));
        }

        var result = await _dbSetupService.TestConnectionAsync(setting);
        return Ok(result);
    }
}