using System.Text.Json.Serialization;

namespace SECUiDEA_ERP_Server.Models.ResultModels;

public class BoolResultModel
{
    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get; }

    [JsonPropertyName("message")]
    public string Message { get; }

    [JsonPropertyName("data")]
    public Dictionary<string, object>? Data { get; }

    private BoolResultModel(bool isSuccess, string? message, Dictionary<string, object>? data = null)
    {
        IsSuccess = isSuccess;
        Message = message;
        Data = data;
    }

    public static BoolResultModel Success(string message = "", Dictionary<string, object>? data = null)
    {
        return new BoolResultModel(true, message, data);
    }

    public static BoolResultModel Fail(string message, Dictionary<string, object>? data = null)
    {
        return new BoolResultModel(false, message, data);
    }
}