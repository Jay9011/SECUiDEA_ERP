using System.Text.Json.Serialization;
using CoreDAL.Configuration;
using CoreDAL.Configuration.Interface;
using CoreDAL.DALs.Interface;
using SECUiDEA_ERP_Server.Models.DBServices;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.Private;

public class ConnectionSettingDefinition
{
    public string Key { get; set; }
    public InputType Type { get; set; }
    public List<string> Options { get; set; } = new();
    public string Value { get; set; }
}

public class DBSetupViewModel
{
    /// <summary>
    /// DB 설정 섹션 이름
    /// </summary>
    public string sectionName { get; set; } = string.Empty;
    /// <summary>
    /// DB 타입
    /// </summary>
    [JsonConverter(typeof(DatabaseTypeJsonConverter))]
    public DatabaseType databaseType { get; set; } = DatabaseType.MSSQL;
    /// <summary>
    /// DB 연결 설정
    /// </summary>
    public Dictionary<string, string> connectionSettings { get; set; } = new Dictionary<string, string>();
    /// <summary>
    /// DB 연결 객체
    /// <returns><see cref="ICoreDAL"/></returns>
    /// </summary>
    public ICoreDAL DAL => DbDalFactory.CreateCoreDal(databaseType);
    /// <summary>
    /// DB 연결 정보
    /// </summary>
    public IDbConnectionInfo ConnectionInfo =>
        DbConnectionFactory.CreateConnectionInfo(databaseType, connectionSettings);

    public List<ConnectionSettingDefinition> GetSettingDefinitions()
    {
        var definitions = new List<ConnectionSettingDefinition>();

        foreach (var setting in connectionSettings.Where(s => s.Key != DatabaseSetup.DBTypeKey))
        {
            var definition = new ConnectionSettingDefinition
            {
                Key = setting.Key,
                Value = setting.Value,
            };

            // input 타입 설정
            switch (setting.Key.ToLower())
            {
                case var x when x.Contains("password"):
                    definition.Type = InputType.Password;
                    break;
                case "integratedsecurity":
                case "protocol":
                    definition.Type = InputType.Select;
                    break;
                default:
                    definition.Type = InputType.Text;
                    break;
            }

            // select 옵션 설정
            if (definition.Type == InputType.Select)
            {
                switch (setting.Key.ToLower())
                {
                    case "integratedsecurity":
                        definition.Options = new List<string> { "True", "False" };
                        break;
                    case "protocol":
                        definition.Options = new List<string> { "TCP", "NP" };
                        break;
                    default:
                        definition.Options = new List<string>();
                        break;
                }
            }

            definitions.Add(definition);
        }
    
        return definitions;
    }
}