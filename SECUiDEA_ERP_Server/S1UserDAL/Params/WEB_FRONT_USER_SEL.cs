using System;
using System.Collections.Generic;
using System.Text;
using CoreDAL.ORM;
using CoreDAL.ORM.Extensions;

namespace S1UserDAL.Params
{
    public class WEB_FRONT_USER_SEL : SQLParam
    {
        public enum Type
        {
            /// <summary>
            /// ID를 가지고 사용자 정보를 찾는다.
            /// </summary>
            FindUser = 1,
        }

        public Type _procType { get; set; }

        [DbParameter("Type")]
        public string GetProcType => _procType.ToString();

        [DbParameter]
        public string ID { get; set; }

        [DbParameter]
        public string UserID { get; set; }
    }
}
