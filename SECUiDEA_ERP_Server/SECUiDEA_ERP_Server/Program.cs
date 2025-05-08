using System.Text;
using System.Text.Json;
using CoreDAL.Configuration;
using CoreDAL.Configuration.Interface;
using CryptoManager;
using CryptoManager.Services;
using FileIOHelper;
using FileIOHelper.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SECUiDEA_ERP_Server.Models.Authentication;
using SECUiDEA_ERP_Server.Models.AuthUser;
using SECUiDEA_ERP_Server.Models.CommonModels;
using SECUiDEA_ERP_Server.Models.DBServices;

namespace SECUiDEA_ERP_Server;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllersWithViews()
            .AddApplicationPart(typeof(Program).Assembly);

        /* ================================================
         * 최우선 기타 설정 시작
         * ================================================
         */
        builder.Services.AddMemoryCache();

        var dbSetupFilePath = Path.Combine(builder.Environment.ContentRootPath, "Upload", "Data", "dbSetup.ini");

        IIOHelper dbSetupFileHelper = new IniFileHelper(dbSetupFilePath);
        builder.Services.AddKeyedSingleton<IIOHelper>(StringClass.IoDbSetupFile, dbSetupFileHelper);
        IIOHelper registryHelper = new RegistryHelper(StringClass.SECUiDEAJWT);
        builder.Services.AddKeyedSingleton<IIOHelper>(StringClass.IoRegistry, registryHelper);

        ICryptoManager S1AES = new S1AES();
        ICryptoManager S1SHA512 = new S1SHA512();
        ICryptoManager SECUiDEA = new SecuAES256();
        builder.Services.AddKeyedSingleton<ICryptoManager>(StringClass.CryptoS1Aes, S1AES);
        builder.Services.AddKeyedSingleton<ICryptoManager>(StringClass.CryptoS1Sha512, S1SHA512);
        builder.Services.AddKeyedSingleton<ICryptoManager>(StringClass.CryptoSecuidea, SECUiDEA);

        var dbContainer = SetupDbContainer(dbSetupFileHelper, SECUiDEA);
        builder.Services.AddSingleton<IDatabaseSetupContainer>(dbContainer);
        builder.Services.AddSingleton<IDBSetupService, DBSetupService>();

        /* ================================================
         * 최우선 기타 설정 종료
         * ================================================
         * ================================================
         * 의존 주입 시작
         * ================================================
         */
        
        // JWT 초기 설정
        JwtService.JwtConfigSetup(registryHelper, SECUiDEA);

        // JWT 인증 설정
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            var jwtSettings = JwtService.GetJwtCollection(registryHelper, SECUiDEA);
            
            options.RequireHttpsMetadata = false;   // TODO: 프로덕션 환경에서는 true로 설정 변경 (http 사용하려면 false로 유지)
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings[StringClass.Issuer],
                ValidAudience = jwtSettings[StringClass.Audience],
                IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(jwtSettings[StringClass.Secret])),
                ClockSkew = TimeSpan.Zero
            };
        });

        builder.Services.AddSingleton<IRefreshTokenRepository, RefreshTokenRepository>();
        builder.Services.AddSingleton<UserRepositoryFactory>();
        builder.Services.AddSingleton<JwtService>();
        builder.Services.AddSingleton<SessionService>();
        builder.Services.AddSingleton<UserAuthService>();


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

        app.UseAuthentication();
        app.UseAuthorization();

        // 루트 경로(/)에서 /visit/ 경로로 리다이렉트하는 미들웨어 추가 (추후 변경 필요)
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.Value == "/")
            {
                context.Response.Redirect("/visit/");
                return;
            }
            
            await next();
        });

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
                    // SPA 방식으로 운영되는 React 앱이므로 컨트롤러 라우팅은 제거하고 폴백만 설정
                    endpoints.MapFallbackToController("Index", "Visit");
                });
            });
        
        app.MapFallbackToFile("/index.html");

        app.Services.GetRequiredService<SessionService>();
        
        app.Run();
    }

    /// <summary>
    /// DB 설정을 위한 DBSetupContainer 생성
    /// </summary>
    /// <param name="dbSetupFileHelper">DB 설정 저장을 위한 IIOHelper</param>
    /// <param name="SECUiDEA">DB 설정 암호화를 위한 CryptoManager</param>
    /// <returns><see cref="DatabaseSetupContainer"/> DB 설정 객체 컨테이너</returns>
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