using System.Text.Json;
using CoreDAL.Configuration;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using CryptoManager.Services;
using FileIOHelper;
using FileIOHelper.Helpers;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.DBServices;

namespace SECUiDEA_ERP_Server;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllersWithViews()
            .AddApplicationPart(typeof(Program).Assembly);
        
        /* ================================================
         * 최우선 기타 설정 시작
         * ================================================
         */
        var dbSetupFilePath = Path.Combine(builder.Environment.ContentRootPath, "Upload", "Data", "dbSetup.ini");
        /* ================================================
         * 최우선 기타 설정 종료
         * ================================================
         * ================================================
         * 의존 주입 시작
         * ================================================
         */
        ICryptoManager S1AES = new S1AES();
        ICryptoManager S1SHA512 = new S1SHA512();
        ICryptoManager SECUiDEA = new SecuAES256();
        builder.Services.AddKeyedSingleton<ICryptoManager>(StringClass.CryptoS1Aes, S1AES);
        builder.Services.AddKeyedSingleton<ICryptoManager>(StringClass.CryptoS1Sha512, S1SHA512);
        builder.Services.AddKeyedSingleton<ICryptoManager>(StringClass.CryptoSecuidea, SECUiDEA);

        IIOHelper dbSetupFileHelper = new IniFileHelper(dbSetupFilePath);
        builder.Services.AddKeyedSingleton<IIOHelper>(StringClass.IoDbSetupFile, dbSetupFileHelper);
        
        var dbContainer = SetupDbContainer(dbSetupFileHelper, SECUiDEA);
        builder.Services.AddSingleton<IDatabaseSetupContainer>(dbContainer);
        builder.Services.AddSingleton<IDBSetupService, DBSetupService>();
        
        
        /* ================================================
         * 의존 주입 종료
         * ================================================
         */
        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();

        app.UseRouting();

        app.UseAuthorization();

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}");

        app.MapWhen(
            ctx => ctx.Request.Path.StartsWithSegments("/visit"),
            visitApp =>
            {
                visitApp.UseStaticFiles();
                visitApp.UseRouting();
                visitApp.UseEndpoints(endpoints =>
                {
                    endpoints.MapControllerRoute(
                        name: "visit",
                        pattern: "{controller=Visit}/{action=Index}/{id?}",
                        defaults: new { controller = "Visit" }
                    );

                    endpoints.MapFallbackToFile("/visit/index.html");
                });
            });
        
        app.MapFallbackToFile("/index.html");
        
        app.Run();
    }

    public static DatabaseSetupContainer SetupDbContainer(IIOHelper dbSetupFileHelper, ICryptoManager SECUiDEA)
    {
        var setupConfigs = new Dictionary<string, (DatabaseType dbType, IIOHelper ioHelper)>
        {
            [StringClass.S1Access] = (DatabaseType.MSSQL, dbSetupFileHelper),
            [StringClass.SECUIDEA] = (DatabaseType.MSSQL, dbSetupFileHelper)
        };

        DatabaseSetupContainer dbContainer = new DatabaseSetupContainer(setupConfigs, SECUiDEA);
        return dbContainer;
    }
}