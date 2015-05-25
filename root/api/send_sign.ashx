<%@ WebHandler Language="C#" Class="send_sign" %>

using System;
using System.Web;
using System.Text;
using System.Data.SqlClient;
using System.Data;
using System.Runtime.Serialization.Json;

public class send_sign : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.Charset = "utf-8";
        context.Response.ContentEncoding = Encoding.UTF8;

        string res = string.Empty;
        string sIllegalString = PublicClass.ChkSQLInjection(context.Request);

        //判斷是否要走SSL
        if ("Y".Equals(System.Configuration.ConfigurationManager.AppSettings["FrontSSL"]) && "OFF".Equals(context.Request.ServerVariables["HTTPS"].ToString().ToUpper()))
        {
            res = "請以HTTPS方式傳送/接收資料!!";
        }
        else
        {
            if (!string.IsNullOrEmpty(sIllegalString))
            {
                res = "您輸入不合法文字:" + sIllegalString;
            }
            else
            {
                string sName = context.Request.Form["name"] == null ? string.Empty : context.Request.Form["name"].Trim();
                string sIdNo = context.Request.Form["sid"] == null ? string.Empty : context.Request.Form["sid"].Trim();
                string sBirth = context.Request.Form["birth"] == null ? string.Empty : context.Request.Form["birth"].Trim();
                string sMobile = context.Request.Form["phone"] == null ? "" : context.Request.Form["phone"].Trim();
                string sEmail = context.Request.Form["email"] == null ? "" : context.Request.Form["email"].Trim().ToLower();
                string sEvent = context.Request.Form["q_event"] == null ? "" : context.Request.Form["q_event"].Trim();
                string sTime = context.Request.Form["q_time"] == null ? "" : context.Request.Form["q_time"].Trim();
                string sLicence = context.Request.Form["q_have_licence"] == null ? "" : context.Request.Form["q_have_licence"].Trim();
                string sRiders = context.Request.Form["q_aeon_friend"] == null ? "" : context.Request.Form["q_aeon_friend"].Trim();
                string sModel = context.Request.Form["q_aeon_type"] == null ? "" : context.Request.Form["q_aeon_type"].Trim();
                string sDateTime = PublicClass.GetTaiwanDateTime().ToString("yyyyMMddHHmmss");
                string sClientIP = PublicClass.GetClientIP(context.Request);
                DateTime dtBirth;

                //記錄資料
                PublicClass.SaveLog("F", context.Request.ServerVariables["URL"], PublicClass.GenLogContent(context.Request), sClientIP, string.Empty);

                if (string.IsNullOrEmpty(sName) || PublicClass.GetStringLength(950, sName) < 3 || PublicClass.GetStringLength(950, sName) > 30)
                {
                    res = "請輸入姓名!!";
                }
                if (!PublicClass.IsValidIdNo(sIdNo))
                {
                    res = "請輸入正確的身份證號!!";
                }
                try
                {
                    dtBirth = DateTime.Parse(sBirth);
                }
                catch (Exception ex)
                {
                    res = "請選擇正確的生日!!";
                }
                if (!PublicClass.IsValidMobile(sMobile))
                {
                    res = "請輸入正確的行動電話!!";
                }
                if (!PublicClass.IsValidEmail(sEmail))
                {
                    res = "請選擇正確的E-mail!!";
                }
                if (string.IsNullOrEmpty(sEvent))
                {
                    res = "請選擇場次!!";
                }
                if (string.IsNullOrEmpty(sTime))
                {
                    res = "請選擇時間!!";
                }
                if (!"是".Equals(sLicence))
                {
                    sLicence = "否";
                }
                if (!"是".Equals(sRiders))
                {
                    sRiders = "否";
                    sModel = string.Empty;
                }

                if (string.IsNullOrEmpty(res))
                {
                    string sSql = @"SIGNUP_1505_SAVE";

                    SqlConnection scConn = new SqlConnection(DataHelper.ConnString);
                    SqlCommand scCmd = new SqlCommand(sSql, scConn);
                    scCmd.CommandType = CommandType.StoredProcedure;

                    scCmd.Parameters.AddWithValue("NAME", sName);
                    scCmd.Parameters.AddWithValue("ID_NO", sIdNo);
                    scCmd.Parameters.AddWithValue("BIRTH", sBirth);
                    scCmd.Parameters.AddWithValue("MOBILE", sMobile);
                    scCmd.Parameters.AddWithValue("EMAIL", sEmail);
                    scCmd.Parameters.AddWithValue("EVENT", sEvent);
                    scCmd.Parameters.AddWithValue("TIME", sTime);
                    scCmd.Parameters.AddWithValue("LICENCE", sLicence);
                    scCmd.Parameters.AddWithValue("RIDERS", sRiders);
                    scCmd.Parameters.AddWithValue("MODEL", sModel);
                    scCmd.Parameters.AddWithValue("CLIENT_IP", sClientIP);
                    scCmd.Parameters.AddWithValue("TODAY_DATETIME_14", sDateTime);
                    scConn.Open();

                    SqlDataAdapter adpAdapter = new SqlDataAdapter(scCmd);
                    DataTable dtTable = new DataTable();
                    adpAdapter.Fill(dtTable);
                    scConn.Close();

                    if (dtTable.Rows.Count > 0)
                    {
                        res = dtTable.Rows[0]["MESSAGE"].ToString();
                    }
                    else
                    {
                        res = "系統忙碌中!!";
                    }
                }
            }
        }
        Result rlt = new Result()
        {
            res = res
        };
        DataContractJsonSerializer json = new DataContractJsonSerializer(rlt.GetType());
        json.WriteObject(context.Response.OutputStream, rlt);
    }

    public class Result
    {
        public string res { get; set; }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}