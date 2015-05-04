/* 	example

	var savFB = new SavFB();
	savFB.init("212169482270500", ""user_about_me", allReady);
	
	savFB.strongLogin(funcSuccess, funcFail);
*/

/*
feed 時用的斷行字符 \u000A

*/

(function(){
	
    "use strict";

    var SavFB = window.SavFB = {};
    var _p = SavFB;

    var _isInit = false;

    SavFB.defaultPermissions = ["public_profile"];

    SavFB.uid = null;
    SavFB.uname = null;
    SavFB.fidList = null;

    /*	Initialize FB API
        cb_yes		function(opt)	callback when initialized
        cb_no		function(opt)	callback when init fail
    */
    SavFB.init = function(appId, cb, logLoginStstus)
    {
        //console.log("init: " + appId);
        window.fbAsyncInit = function()
        {
            FB.init({
                appId      : appId,
                cookie     : true,

                xfbml      : true,
                version    : 'v2.3'
            });

            if(logLoginStstus)
            {
                FB.getLoginStatus(function(response) {
                    statusChangeCallback(response);
                });
            }


            _isInit = true;
            if(cb) cb.apply();

        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    function statusChangeCallback(response)
    {
        console.log('statusChangeCallback');
        console.log(response);
        if (response.status === 'connected') {
            console.log("connected");
        } else if (response.status === 'not_authorized') {
            console.log("not authorized");

        } else {
            console.log("not login");
        }
    }

    SavFB.login = function(permissionArray, cb_yes, cb_no)
    {
        if (!_isInit) { SavFB.init(executeLogin, cb_no); return; }

        var scope = (permissionArray == null)? SavFB.defaultPermissions.join(","): permissionArray.join(",");

        executeLogin();

        function executeLogin()
        {
            FB.login(function (response)
            {
                if (response.authResponse)
                {
                    if(response.status == "connected")
                    {
                        if(cb_yes != null) cb_yes.apply(null);
                    }
                    else
                    {
                        if(cb_no != null) cb_no.apply(null, [{action:"login", response:response, type:response.status, message:"not connected"}]);
                    }
                } else {
                    if(cb_no != null) cb_no.apply(null, [{action:"login", response:response, type:response.status, message:"user cancel login"}]);
                }
            }, {
                scope: scope
            });
        }
    };

    SavFB.getPermissions = function(permissionArray, cb_yes, cb_no, forceGetPermission)
    {
        if(permissionArray == null) permissionArray = _p.defaultPermissions;
        if(forceGetPermission == null) forceGetPermission = true;

        if (!_isInit) { _p.init(testLogin, cb_no); return; }

        var _hasAlreadyExecutedLogin = false;

        testLogin();

        function testLogin(forceExecute)
        {
            FB.getLoginStatus(function(response)
            {
                var auth = FB.getAuthResponse();
                if (forceExecute || auth == null || auth.uid == null)
                {
                    _hasAlreadyExecutedLogin = true;
                    _p.login(permissionArray, __testPermissions, cb_no);
                }
                else
                {
                    __testPermissions();
                }
            });
        }


        function __testPermissions()
        {
            detectPermissions(permissionArray, function()
            {
                console.log("check");
                if (cb_yes != null) cb_yes.apply();
            }, function(failObj)
            {

                console.log("check 2");
                if (forceGetPermission && failObj.type == "lack_permissions" && _hasAlreadyExecutedLogin == false)
                {
                    testLogin(true);
                }
                else if(failObj.type == "user_logout")
                {
                    testLogin(true);
                }
                else
                {
                    console.log(JSON.stringify(failObj));
                    if (cb_no != null) cb_no.apply(null, [failObj]);
                }
            });
        }
    };

    function detectPermissions(permissionArray, cb_yes, cb_no)
    {
        var params = {};
        FB.api("/me/permissions", function(success, fail)
        {
            var cbFailParams;
            cbFailParams =
            {
                action:"detectPermissions",
                type:null,
                response:null
            };

            if (success)
            {
                if(success.data)
                {
                    var permissions = {};

    //                console.log(JSON.stringify(success.data));

                    for(var k=0;k<success.data.length;k++)
                    {
                        permissions[success.data[k].permission] = success.data[k];
                    }

                    var bool = true;

                    var i, n=permissionArray.length;
                    for (i=0;i<n;i++)
                    {
                        var key = permissionArray[i];
                        var obj = permissions[key];

                          if (!obj || obj.status != "granted") { bool = false; break; }
                    }

                    if (bool == true)
                    {
                        if (cb_yes != null) cb_yes.apply(null);
                    }
                    else
                    {
                        cbFailParams.type = "lack_permissions";
                        cbFailParams.message = "lack permissions";
                        cbFailParams.response = success.data;
                        if (cb_no != null) cb_no.apply(null, [cbFailParams]);
                    }
                }
                else if(success.error && success.error.code == 190 && success.error.error_subcode == 467)
                {
                    cbFailParams.type = "user_logout";
                    cbFailParams.response = success.error;
                    cbFailParams.message = success.error.message;
                    if (cb_no != null) cb_no.apply(null, [cbFailParams]);
                }
                else
                {
                    cbFailParams.type = "unknown error";
                    cbFailParams.response = success.error;
                    cbFailParams.message = success.error.message;
                    if (cb_no != null) cb_no.apply(null, [cbFailParams]);
                }
            }
            else if (fail)
            {
                cbFailParams.type = "user_logout";
                cbFailParams.response = fail;
                cbFailParams.message = fail.message;
                if (cb_no != null) cb_no.apply(null, [cbFailParams]);
            }
            else
            {
                cbFailParams.type = "intrupted";
                cbFailParams.response = null;
                cbFailParams.message = "getPermissions intrupted";
                if (cb_no != null) cb_no.apply(null, [cbFailParams]);
            }

        }, params, "GET");
    }

    /** method helpers **/
    SavFB.getUser = function(cb_yes, cb_no)
    {
        _p.getPermissions(["user_about_me"], execute, cb_no);

        function execute()
        {
            FB.api('/me', function (response)
            {
                if(response.id)
                {
                    _p.uid = response.id;
                    _p.uname = response.name;
                    if(cb_yes != null) cb_yes.apply(null);
                }
                else
                {
                    if(cb_no != null) cb_no.apply(null, [
                    {
                        action:"getUser",
                        type:"error",
                        response: response,
                        message: "get user error"
                    }]);
                }
            });
        }
    }

    /*	get friend list from user,
        if succes, response will be an array, , which store a list of friend uid

        cb_yes: callback if success, params [fidList:Array]
        cb_no: callback if fail
    */
    SavFB.getFriendList = function(cb_yes, cb_no)
    {
        console.info("SavFB getFriends");
        FB.api({ method: 'friends.get' }, function(response)
        {
            if (!response || response.error)
            {
                if(cb_no != null) (!response) ? cb_no.apply(null, [
                {
                    action:"getFriends",
                    type:"no_response",
                    response: null,
                    message: "no response when getting friend list"
                }]) : cb_no.apply(null, [
                {
                    action:"getFriends",
                    type:"error",
                    response: response.error,
                    message: response.error.message
                }]);
            }
             else
            {
                _p.fidList = response;
                if(cb_yes != null) cb_yes.apply(null, [response]);
            }
        });
    }


    SavFB.shareImageData = function(imageData, message, cb_yes, cb_no, filename, mimeType)
    {
        _p.getPermissions(["user_about_me", "publish_stream", "publish_actions", "user_photos"], execute, cb_no);

        function execute()
        {
            var authToken = FB.getAuthResponse()['accessToken'];

            if(message == null) message = "";
            if(filename == null) filename = "pic.png";
            if(mimeType == null) mimeType = "image/png";

            var boundary = '----ThisIsTheBoundary1234567890';
            var formData = '--' + boundary + '\r\n'

            formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n' + 'Content-Type: ' + mimeType + '\r\n\r\n';
            formData += imageData + '\r\n';
            formData += '--' + boundary + '\r\n';

            formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
            formData += message + '\r\n';
            formData += '--' + boundary + '--\r\n';

            var xhr = new XMLHttpRequest();
            xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true );

            xhr.onload = function()
            {
                var response = JSON.parse(xhr.responseText);
                if(response.error)
                {
                    if(cb_no != null) cb_no.apply(null, [
                    {
                        action:"shareImageData",
                        type:"fb_error",
                        message:response.error.message,
                        response:response.error
                    }]);
                }
                else if(cb_yes != null) cb_yes.apply(null, [response, formData]);
            };

            xhr.onerror = function()
            {
                console.error("error: " + xhr.responseText);
                if (cb_no != null) cb_no.apply(null, [
                {
                    action:"shareImageData",
                    type:"xml_http_request_error",
                    message:"XMLHttpRequest error",
                    response:xhr.responseText
                }]);
            };

            xhr.onreadystatechange = function()
            {
                if(xhr.status == 404)
                {
                    if (cb_no != null) cb_no.apply(null, [
                    {
                        action:"shareImageData",
                        type:"url_not_found",
                        message:"url not found",
                        response:null
                    }]);
                }
            };

            xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );

            xhr.sendAsBinary( formData );
        }
    };
    /** end **/

    /** misc methods **/
    SavFB.getImageData = function(sourceCanvas, x, y, width, height)
    {
        if(!window.atob) { console.error("need base64 => utf8 decode method(i.e. window.atob)"); return; }

        var canvas, context;

        var sourceContext = sourceCanvas.getContext("2d");
        if(x != null && y != null && width != null && height != null)
        {
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            context = canvas.getContext("2d");

            var sourceImageData = sourceContext.getImageData(x, y, width, height);

            context.putImageData(sourceImageData, 0, 0);
        }
        else
        {
            canvas = sourceCanvas;
            context = canvas.getContext("2d");
        }

        var uri = canvas.toDataURL("image/png");
        var pngBase64 = uri.substring(uri.indexOf(',') + 1, uri.length);
        return window.atob(pngBase64);
    };
    /** end **/

    /*** snippets ***/

    /* share photo

    SavFB.getPermissions(["user_about_me", "publish_stream", "publish_actions", "user_photos"], function()
    {
        var params = { url:imageURL, message:message };

        FB.api("/me/photos", function(response)
        {
            console.info("response = " + JSON.stringify(response));

            var cbFailParams;

            if (response)
            {
                if(response.error) alert(response.error);
                else alert("分享成功.");

                SimplePreloading.hide(true, 1);
            }
            else
            {
                alert("no response from facebook");
                SimplePreloading.hide(true, 1);
            }
        }, params, "POST");

    }, function(failParams)
    {
        console.log("failParams.message");
    });

    */

    /*	FQL

        FB.api(
        {
            method: 'fql.query',
            query: "SELECT like_info from photo WHERE object_id = 464791233608147",
            return_ssl_resources: 1
        },
        function(response)
        {
            console.info(response);
        });
    */

    /* api and ui example

    function feed(name, caption, description, pictureUrl, targetLink)
    {
        _p.getPermissions(["user_about_me", "publish_stream"], execute);

        function execute()
        {
            FB.ui(
            {
                method: 'feed',
                name: name,
                link: targetLink,
                picture: pictureUrl,
                caption: caption,
                description: description
            }, function(response)
            {
                if(response && response.post_id)
                {
                  // success
                }
                else
                {
                  // error
                }
            });
        }
    }
    */

}());