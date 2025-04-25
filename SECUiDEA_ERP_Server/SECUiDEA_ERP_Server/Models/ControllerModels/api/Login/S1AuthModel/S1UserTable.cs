using Newtonsoft.Json;
using UserDALInterface.Entities;

namespace SECUiDEA_ERP_Server.Models.ControllerModels.api.Login.S1AuthModel
{
    public class S1UserTable : IUserEntity
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Seq { get; set; }
        /// <summary>
        /// ID
        /// </summary>
        [JsonProperty("ID", NullValueHandling = NullValueHandling.Ignore)]
        public string Id { get; set; }
        /// <summary>
        /// 비밀번호
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Password { get; set; }
        /// <summary>
        /// 권한 타입
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string AuthType { get; set; }
        /// <summary>
        /// 이름
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string Name { get; set; }
        /// <summary>
        /// 상태
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int PersonStatusID { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string VisitSabunPW { get; set; }
        /// <summary>
        /// 로그인 날짜
        /// </summary>
        [JsonProperty("LastLoginDate", NullValueHandling = NullValueHandling.Ignore)]
        public DateTime LastLogin { get; set; }

        /// <summary>
        /// 세션 타임아웃 설정
        /// </summary>
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public bool EnableSessionTimeout { get; set; } = false;
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public double SessionTimeoutMinutes { get; set; }
    }
}
