using System.Text.Json;
using System.Text.Json.Serialization;
using CoreDAL.Configuration;

namespace SECUiDEA_ERP_Server.Models.DBServices;

public class DatabaseTypeJsonConverter : JsonConverter<DatabaseType>
{
    public override DatabaseType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return DatabaseType.NONE;
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            string value = reader.GetString();
            if (Enum.TryParse(typeof(DatabaseType), value, true, out object result))
            {
                return (DatabaseType)result;
            }
        }
        else if (reader.TokenType == JsonTokenType.Number)
        {
            int value = reader.GetInt32();
            if (Enum.IsDefined(typeof(DatabaseType), value))
            {
                return (DatabaseType)value;
            }
        }

        return DatabaseType.NONE;
    }

    public override void Write(Utf8JsonWriter writer, DatabaseType value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue((int)value);
    }
}