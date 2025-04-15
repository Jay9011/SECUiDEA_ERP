using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using UserDALInterface.Entities;

namespace S1UserDAL.Entities
{
    public class UserTable : IUserEntity
    {
        /// <summary>
        /// ID
        /// </summary>
        [JsonProperty("ID")]
        public string Id { get; set; }
        /// <summary>
        /// 비밀번호
        /// </summary>
        public string Password { get; set; }
        /// <summary>
        /// 로그인 날짜
        /// </summary>
        [JsonProperty("LastLoginDate", NullValueHandling = NullValueHandling.Ignore)]
        public DateTime LastLogin { get; set; }
    }
}
