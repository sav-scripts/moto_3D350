/**
 * Created by index-20 on 2014/4/18.
 */
(function(){
    "use strict";

    var _p = window.DataManager = {};

    var _defaultCloseLoading = true;

    var _sslPathDic =
    {
        "default": "https://secure.realleaf.com.tw/2014/master/",
        "event.theindex.com.tw": "https://event.theindex.com.tw/realleaf/2014/master/",
        "realleaf.theindex.com.tw": "https://realleaf.theindex.com.tw/2014/master/"
    };


    var _shareURLDic =
    {
        "default": "https://secure.realleaf.com.tw/2014/master/",
        "event.theindex.com.tw": "https://event.theindex.com.tw/realleaf/2014/master/",
        "realleaf.theindex.com.tw": "https://event.theindex.com.tw/realleaf/2014/master/"
    };

    _p.getSSLPath = function()
    {
        if(_TEST_) return "";
        else if(_sslPathDic[window.location.host]) return _sslPathDic[window.location.host];
        else return _sslPathDic["default"];
    };


    _p.getShareURL = function(index)
    {
        var url = "";
        if(_TEST_) url = _shareURLDic["event.theindex.com.tw"];
        else if(_sslPathDic[window.location.host]) url = _sslPathDic[window.location.host];
        else url =  _sslPathDic["default"];

        url += "?master="+index+"#/Masters/Detail"+index;

        return url;
    };


    _p.getSessionBirthDay = function()
    {
        var string = getCookie("2014MASTER");
        var data = {};
        if(string!="")
        {
            string = string.replace("y=", "").replace("m=", "").replace("d=", "");
            var array = string.split("&");

            if(array.length != 3) return null;

            data.year = array[0];
            data.month = array[1];
            data.day = array[2];

            return data;
        }
        else
        {
            return null;
        }
    }

    _p.execute = function(scriptName, params, cb_yes, cb_fail, closeLoading, fromMobile)
    {
        SimplePreloading.setProgress("");
        SimplePreloading.show();

        var url;
        var method = "POST";
        if(_TEST_)
        {
            url = "_asp_test/"+scriptName+".html";
            if(fromMobile) url = "../" + url;
            method = "GET";
        }
        else
        {
            url = "asp/"+scriptName+".ashx";
            method = "POST";
        }

        url = _p.getSSLPath() + url;

        $.ajax(
            {
                url: url,
                type: method,
                data: params,
                dataType: "json"
            })
            .done(function(response)
            {
                if(closeLoading || (closeLoading == null && _defaultCloseLoading)) SimplePreloading.hide();
                if(cb_yes != null) cb_yes.apply(null, [response]);

            })
            .fail(function()
            {
                if(closeLoading || (closeLoading == null && _defaultCloseLoading)) SimplePreloading.hide();
                if(cb_fail) cb_fail.apply(null);
            });
    };

    /* private method */
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
        else return "";
    }

}());
