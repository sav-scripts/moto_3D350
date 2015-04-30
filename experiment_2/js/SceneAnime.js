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
            _nodeMap.linkLine.object3D.visible = false;
            _nodeMap.object3D.visible = false;
            _nodeMap.switchLabels(false, 0);

            _guideLine.object3D.visible = false;

            _pointMap.uniforms.introProgress.value = 0;

            _cameraControl.cameraInitPosition.y = -.001;
            //_cameraControl.updateDistance();

            //_guideLine.activeLights();

            _cameraControl.values.distance = _cameraControl.settings.max;

            if(_introTL) _introTL.kill();

        };

        _p.playIntro = function(cb_complete)
        {

            _p.toFirstCut();

            var tl = _introTL = new TimelineMax();

            tl.to(_pointMap.uniforms.introProgress, 10, {value:1, ease:Linear.easeNone}, 0);

            tl.to(_cameraControl.cameraInitPosition, 3, {y: -600, ease:Power1.easeInOut}, 6);

            tl.add(function()
            {
                _guideLine.object3D.visible = true;
            }, 6);

            tl.add(function()
            {


                cb_complete.apply();
            });

            tl.add(function()
            {
                _nodeMap.linkLine.object3D.visible = true;
                _nodeMap.object3D.visible = true;

                _nodeMap.switchLabels(true,.7);

            }, "-=1");


        };

        _p.toDetailMode = function(index)
        {
            NodeMap.instance.isLocking = true;
            CameraControl.instance.isLocking = true;

            _nodeMap.linkLine.object3D.visible = false;
            _nodeMap.object3D.visible = false;
            _nodeMap.switchLabels(false,.7);

            var duration0 = _cameraControl.lookingCenter.length() / 350;
            if(duration0 > 0 && duration0 < .5) duration0 = .5;

            console.log("duration0 = " + duration0);

            var tl = new TimelineMax();
            tl.to(_cameraControl.lookingCenter,duration0, {x:0, y:0, z:0, ease:Power1.easeInOut});
            tl.to(_cameraControl.values,.7, {distance: 1000, ease:Power1.easeIn});
            tl.to(_cameraControl.cameraInitPosition,.7, {y: -.001, ease:Power1.easeOut});

            tl.to(DetailMap.instance.uniforms.maskPower,.7, {value:0}, "-=.4");
            tl.to(DetailMap.instance.uniforms.softPower,.7, {value:0}, "-=.7");
        };


        /** private methods **/
    };

}());