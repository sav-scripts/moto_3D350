/**
 * Created by sav on 2015/5/5.
 */
(function(){

    var _p = window.InputForm =
    {
        settings:
        {
            verticalModeWidth: 770,
            buttonWidth: 374,
            cityIndex: -1
        }
    };

    var _isHiding = true;
    var _isInit = false;
    var _inVerticalMode = false;



    var doms = {};

    var fields = {};

    _p.init = function()
    {
        _isInit = true;

        FormHelper.completeCounty($("#form_county"), $("#form_zone"), "", "", false);

        doms.container = $(".form_layer")[0];
        doms.fieldContainer = $(".field_container")[0];
        doms.checkBoxText = $(".check_box_text")[0];
        doms.title = $(".form_layer .form_title")[0];
        doms.btnClose = $(".form_layer .btn_close")[0];
        doms.btnSend = $(".form_layer .btn_send")[0];
        doms.checkBox = $(".form_layer .check_box")[0];
        doms.ruleText = $(".form_rule_link")[0];

        fields.name = $("#form_name")[0];
        fields.phone = $("#form_phone")[0];
        fields.email = $("#form_email")[0];
        fields.address = $("#form_address")[0];

        $(doms.container).mousewheel(function(event)
        {
            event.stopPropagation();
        });

        doms.title.init =
        {
            w:369,
            h:85,
            ratio: 85/369
        };

        $(doms.btnClose).on("click", function()
        {
           _p.hide(Main.viewToCurrentCity);
        });

        $(doms.btnSend).on("click", function()
        {
           trySend();
        });

        $(doms.ruleText).on("click", function()
        {
            _p.hide();
            Rule.show(_p.show);
        });
    };

    _p.show = function(clearForm)
    {
        if(!_isHiding) return;
        _isHiding = false;

        if(clearForm) resetForm();

        $(doms.container).css("display", "block");

        TweenMax.killTweensOf(doms.container);
        TweenMax.set(doms.container, {alpha:0});
        TweenMax.to(doms.container,.6, {alpha:1});
    };

    _p.hide = function(cb)
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.killTweensOf(doms.container);
        TweenMax.to(doms.container,.6, {alpha:0, onComplete:function()
        {
            $(doms.container).css("display", "none");
            if(cb) cb.apply();
        }});

    };

    _p.onResize = function()
    {
        if(!_isInit) return;

        var width = window.innerWidth;


        if(width <= _p.settings.verticalModeWidth)
        {
            _inVerticalMode = true;

            $(doms.fieldContainer).width(width - 40);
            $(fields.address).width(width - 40 - 70);
            $(doms.checkBoxText).width(width - 40 - 100);


            var minTitleWidth = doms.title.init.w + 40;
            var ratio = doms.title.init.ratio;

            if (width < minTitleWidth)
            {
                $(doms.title).css("width", (width - 40) + "px").css("height", (width - 40) * ratio + "px");
            }
            else
            {
                $(doms.title).css("width", "").css("height", "");
            }

            if(width < _p.settings.buttonWidth)
            {
                $(doms.btnSend).css("margin-left", "");
            }
            else
            {
                $(doms.btnSend).css("margin-left", (width - _p.settings.buttonWidth) *.5 + "px");
            }

        }
        else
        {
            _inVerticalMode = true;

            $(doms.fieldContainer).css('width', "");
            $(fields.address).css('width', "");
            $(doms.checkBoxText).css('width', "");

            $(doms.btnSend).css("margin-left", "");
        }


    };

    /** private  methods **/
    function trySend(cb)
    {
        var obj = checkForm();

        if(obj)
        {
            obj.fb_id = FBHelper.uid;
            obj.fb_name = FBHelper.uname;
            obj.voted_city = _p.cityIndex;
            obj.day = Main.eventProgress;

            console.log(JSON.stringify(obj));

            doSend(obj);
        }
    }

    function doSend(params, cb)
    {
        SimplePreloading.setProgress("");
        SimplePreloading.show();
        //var url = "../document/server_api

        /** test **/

        if(window.location.host == "local.savorks.com")
        {
            SimplePreloading.hide();


            alert("資料送出成功, 感謝您參加活動.");
            InputForm.hide();
            //Main.toRouteMode();
            Main.toVoteMode();

        }
        else
        {
            var url = "api/send_vote.ashx";
            var method = "POST";

            //SimplePreloading.setProgress("");
            //SimplePreloading.show();

            $.ajax
            ({
                url: url,
                type: method,
                data: params,
                dataType: "json"
            })
            .done(function (response)
            {
                //if(closeLoading || (closeLoading == null && _defaultCloseLoading)) SimplePreloading.hide();

                console.log("response = " + JSON.stringify(response));

                if (response.res == "ok")
                {
                    alert("資料送出成功, 感謝您參加活動.");
                    InputForm.hide();
                    //Main.toRouteMode();
                    Main.toVoteMode();
                }
                else
                {
                    alert(response.res);
                }
                SimplePreloading.hide();

            })
            .fail(function ()
            {
                alert("無法取得伺服器資料");
                SimplePreloading.hide();
            });
        }
    }

    function resetForm()
    {
        $(doms.checkBox).attr("checked", false);

        $(fields.name).val("");
        $(fields.phone).val("");
        $(fields.email).val("");
        $(fields.address).val("");

        $("#form_county").prop("selectedIndex", 0);
        FormHelper.completeZone($("#form_county"), $("#form_zone"));
    }

    function checkForm()
    {
        console.log("checked = " + $(doms.checkBox).is(":checked"));
        if(!$(doms.checkBox).is(":checked")){ alert('您必須先閱讀並同意活動辦法'); return; }

        var formObj={};
        var dom;

        dom = fields.name;
        if(PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的名稱'); dom.focus(); return;
        }else formObj.real_name = dom.value;

        dom = fields.phone;
        if(!PatternSamples.phone.test(dom.value))
        {
            alert('請輸入正確的手機號碼'); dom.focus(); return;
        }
        else formObj.phone = dom.value;

        dom = fields.email;
        if(!PatternSamples.email.test(dom.value))
        {
            alert('請輸入正確的電子信箱'); dom.focus(); return;
        }
        else formObj.email = dom.value;


        dom = fields.address;
        if(PatternSamples.onlySpace.test(dom.value))
        {
            alert('請輸入您的地址'); dom.focus(); return;
        }
        else formObj.address = dom.value;

        var addressObj = FormHelper.getAddressValue($("#form_county"), $("#form_zone"));

        if(addressObj.county && addressObj.zone)
        {
            formObj.county = addressObj.county;
            formObj.zone = addressObj.zone;
        }
        else
        {
            alert('請選擇您居住的區域'); return;
        }


        return formObj;
    }


}());

(function(){

    var _p = window.Products = {};

    _p.settings =
    {
        verticalModeWidth: 770
    };

    var doms = {};

    var _isHiding = true;

    var _isInit = false;

    var _inVerticalMode = false;

    var _currentIndex = 0;
    var _isLocking = false;

    _p.init = function()
    {
        _isInit = true;

        doms.container = $(".product_layer")[0];
        doms.btnClose = $(".product_layer .btn_close")[0];
        doms.images = $(".product_image");
        doms.buttons = $(".product_button");

        $(doms.container).mousewheel(function(event)
        {
            event.stopPropagation();
        });

        var i, dom, imageDom;


        for(i=1; i<=7;i++)
        {
            dom = doms.buttons[i-1];
            imageDom = doms.images[i-1];

            if(i <= Main.eventProgress)
            {
                setupButton(dom, i-1);
            }
            else
            {
                $(dom).toggleClass("please_wait", true);
                $(imageDom).toggleClass("please_wait", true);
            }


            $(imageDom).css("display", "block");

            if(i > 1)
            {
                TweenMax.set(imageDom, {autoAlpha:0});
            }
        }

        $(doms.btnClose).on("click", function()
        {
           _p.hide();
        });

        function setupButton(dom, index)
        {
            $(dom).on("click", function()
            {
                _p.changeTo(index);
            });
        }
    };

    _p.changeTo = function(index)
    {
        if(_currentIndex == index) return;
        if(_isLocking) return;

        _isLocking = true;

        var oldImage = doms.images[_currentIndex];
        var newImage = doms.images[index];

        _currentIndex = index;

        TweenMax.to(oldImage,.6, {autoAlpha:0})
        TweenMax.to(newImage,.6, {autoAlpha:1, onComplete:function()
        {
            _isLocking = false;
        }});
    };

    _p.show = function()
    {
        if(!_isHiding) return;
        _isHiding = false;

        $(doms.container).css("display", "block");

        TweenMax.killTweensOf(doms.container);
        TweenMax.set(doms.container, {alpha:0});
        TweenMax.to(doms.container,.6, {alpha:1});
    };

    _p.hide = function()
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.killTweensOf(doms.container);
        TweenMax.to(doms.container,.6, {alpha:0, onComplete:function()
        {
            $(doms.container).css("display", "none");
        }});

    };

    _p.onResize = function()
    {
        if(!_isInit) return;

        var i, image;

        if(window.innerWidth <= _p.settings.verticalModeWidth)
        {
            _inVerticalMode = true;

            var minImageWidth = 458 + 40;
            var minButtonWidth = 393 + 40 + 65;

            for(i=0; i<doms.images.length;i++)
            {
                image = doms.images[i];

                if(window.innerWidth < minImageWidth)
                {
                    $(image).css("width", (window.innerWidth - 40) + "px").css("height", (window.innerWidth - 40)/458 * 494 + "px");
                }
                else
                {
                    $(image).css("width", "").css("height", "");
                }

                TweenMax.set(image, {autoAlpha:1});
            }

            if(window.innerWidth < minButtonWidth)
            {
                $(doms.btnClose).css("width", (window.innerWidth - 40 - 65) + "px").css("height", (window.innerWidth - 40 - 65)/393 * 117 + "px");

            }
            else
            {
                $(doms.btnClose).css("width", "").css("height", "");

            }
        }
        else
        {
            _inVerticalMode = false;

            for(i=0; i<doms.images.length;i++)
            {
                image = doms.images[i];
                var targetAlpha = i == _currentIndex? 1: 0;
                TweenMax.set(image, {autoAlpha:targetAlpha});
            }
        }
    };

}());

(function(){

    var _p = window.Rule = {};

    _p.settings =
    {
        verticalModeWidth: 770
    };

    var _isHiding = true;
    var _isInit = false;
    var _inVerticalMode = false;

    var doms = {};

    var _ss;

    var _cb_after_hide;

    _p.init = function()
    {
        _isInit = true;

        doms.container = $(".rule_layer")[0];
        doms.btnClose = $(".rule_layer .btn_close")[0];
        doms.verticalText = $(".rule_vertical_text")[0];

        $(doms.container).css("display", "block");

        $(doms.container).mousewheel(function(event)
        {
           event.stopPropagation();
        });

        doms.verticalText.init =
        {
            w:500,
            h:6355
        };

        _ss = new SimpleScroller($(".rule_content")[0], 1497, null, true).update();
        _ss.scrollBound(673, -15, 0, 488).update(true);

        $(doms.btnClose).click(function()
        {
            _p.hide();
        });


        $(doms.container).css("display", "none");
    };

    _p.show = function(cb_after_hide)
    {
        if(!_isHiding) return;
        _isHiding = false;

        _cb_after_hide = cb_after_hide;

        $(doms.container).css("display", "block");

        TweenMax.killTweensOf(doms.container);
        TweenMax.set(doms.container, {alpha:0});
        TweenMax.to(doms.container,.6, {alpha:1});
    };

    _p.hide = function()
    {
        if(_isHiding) return;
        _isHiding = true;

        if(_cb_after_hide)
        {
            _cb_after_hide.apply();
            _cb_after_hide = null;
        }

        TweenMax.killTweensOf(doms.container);
        TweenMax.to(doms.container,.6, {alpha:0, onComplete:function()
        {
            $(doms.container).css("display", "none");

        }});

    };

    _p.onResize = function()
    {
        if(!_isInit) return;


        if(window.innerWidth <= _p.settings.verticalModeWidth)
        {
            _inVerticalMode = true;

            var minButtonWidth = 393 + 40 + 65;
            var minVerticalWidth = doms.verticalText.init.w + 40;
            var ratio = doms.verticalText.init.h / doms.verticalText.init.w;

            if (window.innerWidth < minVerticalWidth)
            {
                $(doms.verticalText).css("width", (window.innerWidth - 40) + "px").css("height", (window.innerWidth - 40) * ratio + "px");
            }
            else
            {
                $(doms.verticalText).css("width", "").css("height", "");
            }


            if(window.innerWidth < minButtonWidth)
            {
                $(doms.btnClose).css("width", (window.innerWidth - 40 - 65) + "px").css("height", (window.innerWidth - 40 - 65)/393 * 117 + "px");

            }
            else
            {
                $(doms.btnClose).css("width", "").css("height", "");

            }
        }
        else
        {
            _inVerticalMode = false;

        }

    };

}());
