/**
 * Created by sav on 2015/5/2.
 */
(function(){

    var _p = window.TopUI = {};

    var _menuDom;

    var _isOpen = false;
    var _isHiding = true;

    var _isPermOpemMode = false;

    var Doms = {};

    _p.init = function()
    {
        _menuDom = $(".menu")[0];

        Doms.menuIcon = $(".menu_icon")[0];
        Doms.btnFB = $(".menu_btn_fb")[0];
        Doms.btnRule = $(".menu_btn_rule")[0];
        Doms.btnProduct = $(".menu_btn_product")[0];
        Doms.logo = $(".logo")[0];

        /*
        $(_menuDom).on("mouseover", function(event)
        {
            if($(_menuDom).has(event.relatedTarget).length || event.relatedTarget == _menuDom) return;

            openMenu();
        });
        */


        $(Doms.logo).on("click", function()
        {
            window.open("http://www.aeonmotor.com.tw/home.php", "_blank");
        });



        TweenMax.set(Doms.btnFB, {marginRight: -250});
        TweenMax.set(Doms.btnRule, {marginRight: -250});
        TweenMax.set(Doms.btnProduct, {marginRight: -250});

        $(Doms.btnFB).on("click", function()
        {
            $(_menuDom).trigger("mouseout");
           //closeMenu();

            //InputForm.show(true);

            FB.ui({
                method: 'share',
                href: window.location.href
            }, function(response){});


        });

        $(Doms.btnRule).on("click", function()
        {
            $(_menuDom).trigger("mouseout");
            //closeMenu();

            Rule.show();
        });

        $(Doms.btnProduct).on("click", function()
        {
            $(_menuDom).trigger("mouseout");
            //closeMenu();

            Products.show();
        });

        _p.onResize(true);

    };

    _p.show = function()
    {
        if(!_isHiding) return;
        _isHiding = false;

        TweenMax.to(_menuDom,.6, {top:0});
        TweenMax.to(Doms.logo, .6, {marginTop: 0});
    };

    _p.hide = function()
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.to(_menuDom,.6, {top:-40});
        TweenMax.to(Doms.logo, .6, {marginTop: -40});

    };

    _p.onResize = function(isFirstRun)
    {
        var wasPermOpenMode = _isPermOpemMode;

        _isPermOpemMode = !(window.innerWidth < 480);

        if(isFirstRun || wasPermOpenMode != _isPermOpemMode)
        {
            if(_isPermOpemMode)
            {
                $(_menuDom).unbind("mouseout");
                $(Doms.menuIcon).unbind("mouseover").unbind("click");
                $(_menuDom).unbind("mouseout");

                openMenu(0);
            }
            else
            {

                $(_menuDom).on("mouseout", function(event)
                {
                    if($(_menuDom).has(event.relatedTarget).length || event.relatedTarget == _menuDom) return;

                    closeMenu();
                });

                $(Doms.menuIcon).on("click", function()
                {
                    openMenu();
                });


                $(Doms.menuIcon).on("mouseover", function()
                {
                    openMenu();
                });

                closeMenu();

            }
        }

    };

    function openMenu(duration)
    {
        if(_isOpen) return;
        _isOpen = true;

        if(duration == null) duration = .6;

        TweenMax.to(Doms.menuIcon,duration, {marginRight: -250});
        TweenMax.to(Doms.btnFB,duration, {marginRight: 0}, .3);
        TweenMax.to(Doms.btnRule,duration, {marginRight: 0}, .3);
        TweenMax.to(Doms.btnProduct,duration, {marginRight: 0},.3);

        if(window.innerWidth < 440)
        {
            //TweenMax.to(Doms.logo, .6, {left: -250});
            TweenMax.to(Doms.logo, .6, {marginTop: -40});
        }
    }

    function closeMenu()
    {
        if(!_isOpen) return;
        _isOpen = false;

        TweenMax.to(Doms.btnFB,.6, {marginRight: -250});
        TweenMax.to(Doms.btnRule,.6, {marginRight: -250});
        TweenMax.to(Doms.btnProduct,.6, {marginRight: -250});
        TweenMax.to(Doms.menuIcon,.6, {marginRight: 0},.6);


        if(window.innerWidth < 440)
        {
            //TweenMax.to(Doms.logo, .6, {left: 0});
            TweenMax.to(Doms.logo, .6, {marginTop: 0});
        }
    }

}());

(function(){

    var _p = window.TimelineUI = {};

    var NUM_NODES = 7;
    var MIN_GAP = 170;

    var _eventProgress = 1;

    var _time = new Date().getTime();
    var _daySec = 24 * 60 * 60;
    var _dayMileSec = _daySec * 1000;
    var _hourMileSec = 60 * 60 * 1000;
    var _minuteMileSec = 60 * 1000;

    var _startSec;
    //console.log(oldTime);

    var _totalWidth;

    var _isHiding = true;

    var _timelineDom;

    var _isLocking = false;
    var _inCenterMode = false;

    var $nodePart;

    var _timeLabel;

    var _timeLabelDefaultText = "3D-350抵台時間<br/>";

    var _soundDom;

    var _isSoundOn = true;
    var _wasSoundOn = true;


    _p.init = function()
    {
        _eventProgress = Main.currentData.day;

        _timelineDom = $(".timeline_layer")[0];

        $nodePart = $(".node_part");

        _soundDom = $(".sound_icon")[0];

        $(_soundDom).on("click", function()
        {
           _isSoundOn = !_isSoundOn;
            updateSoundStatus();

        });


        var systemTime = Main.currentData.system_time;
        var array = systemTime.split(":");
        var hh = parseInt(array[0]);
        var mm = parseInt(array[1]);
        var ss = parseInt(array[2]);

        _startSec = hh * 3600 + mm * 60 + ss;




        _timeLabel = document.createElement("div");
        _timeLabel.className = "time_label";
        _timelineDom.appendChild(_timeLabel);
        TweenMax.set(_timeLabel, {rotation:-70, transformOrigin:"left 50%", alpha:0});

        var timeLabelTl = new TimelineMax({repeat:-1});
        timeLabelTl.add(function()
        {
            if(Main.eventProgress < Main.finalDay)
            {

                var restDays = 7 - _eventProgress - 1;
                var nowMileSec = _startSec * 1000 + (new Date().getTime() - _time);

                var dMileSec = _dayMileSec - nowMileSec;

                dMileSec += restDays * _dayMileSec;

                var hour = parseInt(dMileSec / _hourMileSec);
                var minute = String(parseInt((dMileSec%_hourMileSec)/_minuteMileSec) + 100).substr(1);
                var sec = String(parseInt((dMileSec%_minuteMileSec)/1000) + 100).substr(1);
                var mSec = String(dMileSec%1000 + 1000).substr(1);

                _timeLabel.innerHTML = _timeLabelDefaultText + hour + ":" + minute + ":" + sec + ":" + mSec;

            }
            else
            {
                _timeLabel.innerHTML = "GOAL!";
            }

        },.033);



        _totalWidth = (NUM_NODES-1) * MIN_GAP;
        var startX =(-_totalWidth) * .5;
        var nodeDom, labelDom;


        for(var i=0;i<NUM_NODES;i++)
        {
            nodeDom = document.createElement("div");
            nodeDom.className = "timeline_node_past";
            if(i == _eventProgress) nodeDom.className = "timeline_node_now";
            if(i > _eventProgress) nodeDom.className = "timeline_node_future";

            $nodePart.append(nodeDom);

            var targetLeft = startX + MIN_GAP*i;

            $(nodeDom).css("left", targetLeft);


            /*
            if(i < _eventProgress)
            {
                var cityIndex = Main.currentData.event_route[i];
                createLabelDom(cityIndex, i);

            }
            else if(i == _eventProgress)
            {
                labelDom = document.createElement("div");
                labelDom.className = "city_label_question";


                $(labelDom).css("left", targetLeft);
                $nodePart.append(labelDom);
            }
            */

            var cityIndex = Main.currentData.allCitys[i];
            createLabelDom(cityIndex, i);
        }


        var _tl = new TimelineMax({repeat:-1, pause:true});
        _tl.add(_p.update, 60);

        _p.onResize();

        function createLabelDom(cityIndex, dayIndex)
        {
            //console.log("cityIndex = " + cityIndex + ", dayIndex = " + dayIndex);
            var labelDom = CityLabels.getSmallCityLabelDom(cityIndex);

            $(labelDom).css("left", targetLeft);

            $nodePart.append(labelDom);

            $(labelDom).on("click", function()
            {
                if(_isLocking || _isHiding) return;

                SceneAnime.instance.toDetailMode(dayIndex);
            });

            $(labelDom).on("mouseover", function()
            {
                if(_isLocking || _isHiding) return;

                Main.detailMap.show(dayIndex);

            });

            $(labelDom).on("mouseout", function()
            {
                if(_isLocking || _isHiding) return;

                Main.detailMap.hide();

            });
        }

    };

    _p.muteSound = function()
    {
        _wasSoundOn = _isSoundOn;
        _isSoundOn = false;
        updateSoundStatus();
    };

    _p.recoverSound = function()
    {
        _isSoundOn = _wasSoundOn;
        updateSoundStatus();
    };

    function updateSoundStatus()
    {
        if(_isSoundOn)
        {
            $(_soundDom).toggleClass("sound_off", false);
        }
        else
        {
            $(_soundDom).toggleClass("sound_off", true);
        }

        SoundPlayer.switchBGM(_isSoundOn);
    }

    _p.show = function()
    {
        if(!_isHiding) return;
        _isHiding = false;

        TweenMax.killTweensOf(_timelineDom);
        TweenMax.to(_timelineDom,.6, {bottom:0});

        TweenMax.killTweensOf(_timeLabel);
        TweenMax.to(_timeLabel,.5, {alpha:1});
    };

    _p.hide = function()
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.killTweensOf(_timelineDom);
        TweenMax.to(_timelineDom,.6, {bottom:-90});

        TweenMax.killTweensOf(_timeLabel);
        TweenMax.to(_timeLabel,.5, {alpha:0});

    };

    _p.onResize = function()
    {
        var minWidth = _totalWidth + 60;

        if(window.innerWidth > minWidth)
        {
            _inCenterMode = false;
            $nodePart.css("left", "50%");
        }
        else
        {
            _inCenterMode = true;
            var middle = MIN_GAP * .5 + (_eventProgress-1) * MIN_GAP;

            $nodePart.css("left", (_totalWidth *.5 - middle) + window.innerWidth *.5);

            //console.log("middle = " + middle);
        }

        _p.update();

    };

    _p.update = function()
    {

        var dayUnitPercent = MIN_GAP / window.innerWidth * 100;

        var dSec = (new Date().getTime() - _time) / 1000;

        var sec = _startSec + dSec;

        var dayProgress = sec / _daySec * dayUnitPercent;
        if(Main.eventProgress >= Main.finalDay) dayProgress = 0;

        var percent;

        if(_inCenterMode)
        {
            percent = 50 - dayUnitPercent*.5 + dayProgress;
        }
        else
        {
            var startProgress = ((window.innerWidth - _totalWidth) * .5) / window.innerWidth * 100 +  (_eventProgress-1) * dayUnitPercent;

            percent = startProgress + dayProgress;

        }

        $(".progress_line").css("width", percent + "%");
        $(".progress_line_head").css("left", percent + "%");
        $(".progress_line_head_2").css("left", percent + "%");

        $(_timeLabel).css("left", percent + "%");

        //console.log("day progress = " + dayProgress);

        //console.log("dTime = " + dTime);
    };

}());


(function(){

    var _p = window.CityLabels = {};

    var _cityLabelDic = {};

    _p.init = function(cb)
    {
        /*
         var dom = document.createElement("div");
         dom.className = "city_label_image";
         $("body").append(dom);
         */

        var array = [];
        var key,
            index = 0;

        for(key in Main.city_data)
        {
            array.push(Main.city_data[key]);
        }



        //var array = Main.city_data.city_data,


        loadOne();

        function loadDone()
        {
            cb.apply();
        }

        function loadOne()
        {
            var dataObj = array[index];
            var cityIndex = dataObj.index;

            var obj = _cityLabelDic[cityIndex] = {};

            obj.labelSrc = "images/city_label_" + cityIndex + ".png";
            obj.smallLabelSrc ="images/city_label_small_" + cityIndex + ".png";

            var image = new Image();
            image.onload = function()
            {
                smallImage.src = obj.smallLabelSrc;
                obj.labelWidth = image.width;
            };

            image.onerror = function()
            {
                alert("fail when loaindg city label for: ["+dataObj.name_en+"]");
            };

            var smallImage = new Image();
            smallImage.onload = function()
            {
                obj.smallLabelWidth = smallImage.width;

                index++;
                (index < array.length)? loadOne(): loadDone();
            };

            smallImage.onerror = function()
            {
                alert("fail when loaindg city label small for: ["+dataObj.name_en+"]");
            };

            image.src = obj.labelSrc;
        }
    };

    _p.getCityLabelDom = function(cityIndex)
    {
        var obj = _cityLabelDic[cityIndex];
        if(!obj) console.error("cityIndex: " + cityIndex + " not exist.");

        var dom = obj.labelDom;
        if(!dom)
        {
            dom = obj.labelDom = document.createElement("div");
            dom.className = "city_label_image";
            $(dom).css("width", obj.labelWidth).css("background-image", "url("+obj.labelSrc+")");
        }

        return dom;
    };

    _p.getSmallCityLabelDom = function(cityIndex)
    {
        var obj = _cityLabelDic[cityIndex];
        if(!obj) console.error("cityIndex: " + cityIndex + " not exist.");

        var dom = obj.smallLabelDom;
        if(!dom)
        {
            dom = obj.smallLabelDom = document.createElement("div");
            dom.className = "city_label_small";
            $(dom).css("width", obj.smallLabelWidth).css("background-image", "url("+obj.smallLabelSrc+")").css("margin-left", -obj.smallLabelWidth *.5);
        }

        return dom;
    };

}());

(function(){

    var _p = window.IndexIntro = {};

    var doms = {};

    var _isHiding = true;
    var _isSwitchHiding = true;

    var _isInit = false;

    _p.init = function()
    {
        _isInit = true;

        doms.container = $(".index_intro")[0];
        doms.cover = $(".index_intro_cover")[0];
        doms.text = $(".index_intro_text")[0];
        doms.button = $(".index_intro_button")[0];
        doms.switchButton = $(".index_switch_button")[0];

        $(doms.container).mousewheel(function(event)
        {
            event.stopPropagation();
        });


        doms.text.init =
        {
            w:370,
            h:126,
            ratio:126/370
        };


        $(doms.container).css("display", "none");

        $(doms.button).on("click", function()
        {
            FBHelper.login(["public_profile"], function()
            {
                FB.api('/me', function(response)
                {
                    FBHelper.uname = response.name;

                    //console.log("fb uid: " + FBHelper.uid + ", uname: " + FBHelper.uname);

                    _p.hide(function()
                    {
                        Main.toVoteMode(true);
                        //Main.toRouteMode();
                    });
                });


            }, function()
            {
                alert("請先登入 Facebook 才能參加活動.\n facebook 測試帳號: kzyfzxc_sidhuwitz_1430913477@tfbnw.net\n 密碼: 1234");
            });
            /*
            _p.hide(function()
            {
                Main.toVoteMode();
            });
            */
        });

        $(doms.switchButton).on("click", function()
        {
           if(Main.currentMode == "vote")
           {
               Main.toRouteMode();
           }
            else
           {
               Main.toVoteMode();
           }
        });
    };

    _p.show = function()
    {
        if(!_isHiding) return;
        _isHiding = false;

        $(doms.container).css("display", "block");

        var array = [doms.cover, doms.text, doms.button];

        var tl = new TimelineMax();
        tl.set(doms.container, {alpha:1});
        tl.set(array, {alpha:0});
        tl.staggerTo(array,.6, {alpha:1},.3);

    };

    _p.hide = function(cb)
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.to(doms.container,.6, {alpha:0, onComplete:function()
        {
            $(doms.container).css("display", "none");
            if(cb) cb.apply();
        }});

    };

    _p.showSwitchButton = function(isVoteMode, cb)
    {
        if(cb) cb.apply();
        /*
        if(!_isSwitchHiding) return;
        _isSwitchHiding = false;

        $(doms.switchButton).toggleClass("mode2", isVoteMode == true);

        $(doms.switchButton).css("display", "block");
        TweenMax.killTweensOf(doms.switchButton);
        TweenMax.set(doms.switchButton, {alpha:0});
        TweenMax.to(doms.switchButton,.6, {alpha:1, onComplete:function()
        {
            if(cb) cb.apply();
        }});
        */


    };

    _p.hideSwitchButton = function(cb)
    {
        if(cb) cb.apply();

        /*
        if(_isSwitchHiding) return;
        _isSwitchHiding = true;

        TweenMax.killTweensOf(doms.switchButton);
        TweenMax.to(doms.switchButton,.6, {alpha:0, onComplete:function()
        {
            $(doms.switchButton).css("display", "none");
            if(cb) cb.apply();
        }});
        */
    };

    _p.onResize = function ()
    {
        if(!_isInit) return;

        var width = window.innerWidth;
        if(width <= 430)
        {
            var minTitleWidth = doms.text.init.w + 40;
            var ratio = doms.text.init.ratio;

            if (width < minTitleWidth)
            {
                var tw = width - 40;
                var th = (width - 40) * ratio;
                $(doms.text).css("width", tw + "px").css("height", th + "px").css("margin-left", -tw *.5 + "px").css("margin-top", -47-th *.5+"px");
            }
            else
            {
                $(doms.text).css("width", "").css("height", "").css("margin-left", "").css("margin-top", "");
            }
        }
    };


}());

(function(){

    var _p = window.ConfirmDialog = {};

    var _isHiding = true;

    var doms = {};



    _p.init = function()
    {
        doms.container = $(".confirm_dialog")[0];
        doms.btnYes = $(".confirm_dialog .btn_yes")[0];
        doms.btnNo = $(".confirm_dialog .btn_no")[0];
        doms.text = $(".confirm_dialog .dialog_text")[0];
        doms.cityName = $(".confirm_dialog .dialog_city_name")[0];


        $(doms.container).mousewheel(function(event)
        {
            event.stopPropagation();
        });

        $(doms.container).css("display", "block").detach();
    };

    _p.show = function(cityName, cb_yes, cb_no, cb_complete)
    {
        if(!_isHiding) return;
        _isHiding = false;

        $(doms.cityName).text(cityName);

        $(doms.btnYes).unbind("click");
        $(doms.btnNo).unbind("click");

        $("body").append(doms.container);

        TweenMax.killTweensOf(doms.container);
        TweenMax.set(doms.container, {alpha:0});
        TweenMax.to(doms.container,.6, {alpha:1, onComplete:function()
        {
            $(doms.btnYes).on("click", function()
            {
                _p.hide(cb_yes);
            });

            $(doms.btnNo).on("click", function()
            {
                _p.hide(cb_no);
            });

            if(cb_complete) cb_complete.apply();

        }});

    };

    _p.hide = function(cb)
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.killTweensOf(doms.container);
        TweenMax.to(doms.container,.6, {alpha:0, onComplete:function()
        {
            $(doms.container).detach();
            if(cb) cb.apply();
        }});

    };



}());