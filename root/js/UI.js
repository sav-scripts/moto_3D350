/**
 * Created by sav on 2015/5/2.
 */
(function(){

    var _p = window.TopUI = {};

    var _menuDom;

    var _isOpen = false;
    var _isHiding = true;

    var Doms = {};

    _p.init = function()
    {
        _menuDom = $(".menu")[0];

        Doms.menuIcon = $(".menu_icon")[0];
        Doms.btnFB = $(".menu_btn_fb")[0];
        Doms.btnRule = $(".menu_btn_rule")[0];
        Doms.btnProduct = $(".menu_btn_product")[0];
        Doms.logo = $(".logo")[0];

        $(_menuDom).on("mouseover", function(event)
        {
            if($(_menuDom).has(event.relatedTarget).length || event.relatedTarget == _menuDom) return;

            openMenu();
        });

        $(_menuDom).on("mouseout", function(event)
        {
            if($(_menuDom).has(event.relatedTarget).length || event.relatedTarget == _menuDom) return;

            closeMenu();
        });

        $(Doms.menuIcon).on("click", function()
        {
           openMenu();
        });

        /*
        $(Doms.menuIcon).on("mouseover", function()
        {
            openMenu();
        });
        */

        TweenMax.set(Doms.btnFB, {marginRight: -250});
        TweenMax.set(Doms.btnRule, {marginRight: -250});
        TweenMax.set(Doms.btnProduct, {marginRight: -250});

        $(Doms.btnFB).on("click", function()
        {
            $(_menuDom).trigger("mouseout");
           //closeMenu();
        });

        $(Doms.btnRule).on("click", function()
        {
            $(_menuDom).trigger("mouseout");
            //closeMenu();
        });

        $(Doms.btnProduct).on("click", function()
        {
            $(_menuDom).trigger("mouseout");
            //closeMenu();
        });

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

    function openMenu()
    {
        if(_isOpen) return;
        _isOpen = true;

        TweenMax.to(Doms.menuIcon,.6, {marginRight: -250});
        TweenMax.to(Doms.btnFB,.6, {marginRight: 0}, .3);
        TweenMax.to(Doms.btnRule,.6, {marginRight: 0}, .3);
        TweenMax.to(Doms.btnProduct,.6, {marginRight: 0},.3);
    }

    function closeMenu()
    {
        if(!_isOpen) return;
        _isOpen = false;

        TweenMax.to(Doms.btnFB,.6, {marginRight: -250});
        TweenMax.to(Doms.btnRule,.6, {marginRight: -250});
        TweenMax.to(Doms.btnProduct,.6, {marginRight: -250});
        TweenMax.to(Doms.menuIcon,.6, {marginRight: 0},.6);
    }

}());

(function(){

    var _p = window.TimelineUI = {};

    var NUM_NODES = 7;
    var MIN_GAP = 170;

    var _eventProgress = 1;

    var _time = new Date().getTime();
    var _totalSec = 24 * 60 * 60;
    var _startSec;
    //console.log(oldTime);

    var _totalWidth;

    var _isHiding = true;

    var _timelineDom;

    var _isLocking = false;
    var _inCenterMode = false;

    var $nodePart;


    _p.init = function()
    {
        _eventProgress = Main.currentData.day;

        _timelineDom = $(".timeline_layer")[0];

        $nodePart = $(".node_part");

        var systemTime = Main.currentData.system_time;
        var array = systemTime.split("/");
        var hh = parseInt(array[0]);
        var mm = parseInt(array[1]);
        var ss = parseInt(array[2]);

        _startSec = hh * 3600 + mm * 60 + ss;


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
        }


        var _tl = new TimelineMax({repeat:-1, pause:true});
        _tl.add(_p.update, 60);

        _p.onResize();

        function createLabelDom(cityIndex, dayIndex)
        {
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

    _p.show = function()
    {
        if(!_isHiding) return;
        _isHiding = false;

        TweenMax.killTweensOf(_timelineDom);
        TweenMax.to(_timelineDom,.6, {bottom:0});
    };

    _p.hide = function()
    {
        if(_isHiding) return;
        _isHiding = true;

        TweenMax.killTweensOf(_timelineDom);
        TweenMax.to(_timelineDom,.6, {bottom:-90});

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

        var dayProgress = sec / _totalSec * dayUnitPercent;

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

        //console.log("day progress = " + dayProgress);

        //console.log("dTime = " + dTime);
    };

}());