/**
 * Created by sav on 2015/4/30.
 */
(function(){

    window.SceneAnime = function(_pointMap, _cameraControl, _guideLine, _baseMap, _nodeMap)
    {
        /** constructor **/
        var _p = window.SceneAnime.instance = this;

        var _introTL;

        /** public methods **/
        _p.toFirstCut = function()
        {
            MyThreeHelper.tweenOpacity(_nodeMap.linkLine.object3D, 0);
            MyThreeHelper.tweenOpacity(_nodeMap.object3D, 0);
            MyThreeHelper.tweenOpacity(_baseMap.object3D, 0);

            _nodeMap.switchLabels(false, 0);

            MyThreeHelper.tweenOpacity(_guideLine.object3D, 0);

            _pointMap.uniforms.introProgress.value = 0;

            _cameraControl.cameraInitPosition.y = -.001;
            _cameraControl.lock();
            //_cameraControl.updateDistance();

            //_guideLine.activeLights();

            _cameraControl.values.distance = _cameraControl.settings.max;

            _pointMap.object3D.position.y = 0;

            MyThreeHelper.tweenOpacity(_pointMap.object3D, 0);
            MyThreeHelper.tweenOpacity(_pointMap.object3D, 1, 1);



            MyThreeHelper.tweenOpacity(IntroText.object3D, 0);
            IntroText.object3D.position.y = -100;



            if(_introTL) _introTL.kill();

        };

        _p.playIntro = function(cb_complete)
        {

            //_p.toFirstCut();

            var pauseDuration = 2.6;
            var twistDuration = .9;

            IntroText.object3D.visible = true;

            var tl0 = _introTL = new TimelineMax();


            tl0.to(_cameraControl.values,2, {distance:900, ease:Power1.easeInOut});
            tl0.to(_pointMap.object3D.position, 1, {y:100, ease:Power1.easeIn},1);
            tl0.to(IntroText.uniforms.opacity,.8, {value:1, ease:Power1.easeIn} ,1.8);

            tl0.to(IntroText.uniforms.twistPower, twistDuration, {value:2, ease:Power1.easeIn}, "+=" + pauseDuration);
            tl0.to(IntroText.uniforms.opacity, twistDuration, {value:0, ease:Power1.easeIn} , "-=" + twistDuration);

            tl0.add(function()
            {
                IntroText.changeText(1);
                IntroText.uniforms.twistPower.value = -2;
            });

            tl0.to(IntroText.uniforms.twistPower, twistDuration, {value:0, ease:Power1.easeOut});
            tl0.to(IntroText.uniforms.opacity, twistDuration, {value:1, ease:Power1.easeOut} , "-=" + twistDuration);

            tl0.to(IntroText.uniforms.twistPower, twistDuration, {value:2, ease:Power1.easeIn}, "+=" + pauseDuration);
            tl0.to(IntroText.uniforms.opacity, twistDuration, {value:0, ease:Power1.easeIn} , "-=" + twistDuration);


            //return;

            var tl = _introTL = new TimelineMax();

            tl.to(_pointMap.object3D.position, 1, {y:0, ease:Power1.easeInOut}, "-=.9");


            tl.to(_pointMap.uniforms.introProgress, 10, {value:1, ease:Linear.easeNone}, 0);

            tl.to(_cameraControl.cameraInitPosition, 3, {y: -600, ease:Power1.easeInOut}, 6);

            tl.add(function()
            {
                //_guideLine.object3D.visible = true;
                MyThreeHelper.tweenOpacity(_guideLine.object3D, 1, 1);
            }, 6);

            tl.add(function()
            {
                cb_complete.apply();
            });

            tl.to(_cameraControl.values, 2, {distance: 800, ease:Power1.easeInOut}, "-=2");
            tl.add(function()
            {

            },"-=2");

            tl.add(function()
            {
                //MyThreeHelper.tweenOpacity(_nodeMap.linkLine.object3D, 1,.5);
                //MyThreeHelper.tweenOpacity(_nodeMap.object3D, 1,.5);
                //_nodeMap.switchLabels(true,.7);

                MyThreeHelper.tweenOpacity(_baseMap.object3D, 1,.5);

                _cameraControl.unlock();
                _cameraControl.updateValues();

            }, "-=1");

            tl0.add(tl);

            tl0.restart();

        };

        _p.toDetailMode = function(index)
        {
            _cameraControl.lock();

            NodeMap.instance.isLocking = true;
            CameraControl.instance.isLocking = true;

            MyThreeHelper.tweenOpacity(_nodeMap.linkLine.object3D, 0,.7);
            MyThreeHelper.tweenOpacity(_nodeMap.object3D, 0,.7);
            _nodeMap.switchLabels(false,.5);
            MyThreeHelper.tweenOpacity(GuideLine.instance.object3D, 0, 1);

            GuideLine.instance.deactiveLights();

            var duration0 = _cameraControl.lookingCenter.length() / 350;
            if(duration0 > 0 && duration0 < .5) duration0 = .5;

            //console.log("duration0 = " + duration0);

            var obj = Main.getVideoViewSetting();

            DetailMap.instance.resize(1);


            TimelineUI.hide();


            var tl = new TimelineMax();
            tl.to(_cameraControl.lookingCenter,duration0, {x:0, y:0, z:0, ease:Power1.easeInOut});
            tl.to(_cameraControl.values,.7, {distance: obj.distance, ease:Power1.easeIn});
            tl.to(_cameraControl.cameraInitPosition,.7, {y: -.001, ease:Power1.easeOut});

            tl.to(DetailMap.instance.uniforms.scale,.7, {value:1}, "-=.4");
            tl.to(DetailMap.instance.uniforms.softPower,.7, {value:0}, "-=.7");

            tl.add(function()
            {
                Main.inVideoMode = true;
                VideoPlayer.playVideo(index);
            });


            //var sa
        };

        _p.backToMap = function()
        {
            var tl = new TimelineMax();
            tl.to(_cameraControl.cameraInitPosition,.7, {y: -600, ease:Power1.easeIn});
            tl.to(_cameraControl.values,.7, {distance: 800, ease:Power1.easeOut});
            tl.add(function()
            {

                //DetailMap.instance.uniforms.maskPower.value = DetailMap.instance.settings["mask power"];
                DetailMap.instance.uniforms.scale.value = DetailMap.instance.settings.scale;
                DetailMap.instance.uniforms.softPower.value = 1;

                MyThreeHelper.tweenOpacity(_nodeMap.linkLine.object3D, 1,.5);
                MyThreeHelper.tweenOpacity(_nodeMap.object3D, 1,.5);

                MyThreeHelper.tweenOpacity(GuideLine.instance.object3D, 1, 1);

                _nodeMap.switchLabels(true,.7);

                _cameraControl.unlock();
                _cameraControl.updateValues();

                NodeMap.instance.isLocking = false;
                CameraControl.instance.isLocking = false;

                TimelineUI.show();

                Main.viewToCity();

            });
        };

        _p.switchMapContent = function(showIt, duration)
        {
            var opacity = showIt? 1: 0;
            if(duration == null) duration = .6;
            MyThreeHelper.tweenOpacity(_nodeMap.linkLine.object3D, opacity, duration);
            MyThreeHelper.tweenOpacity(_nodeMap.object3D, opacity, duration);

            _nodeMap.switchLabels(showIt, duration);

        };



        /** private methods **/
    };

}());