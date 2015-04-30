/**
 * Created by sav on 2015/4/27.
 */
(function(){

    window.DetailMap = function(_mapData)
    {
        var _p = window.DetailMap.instance = this;

        _p.settings =
        {
            "opacity":.8,
            "mask power": .7
        };

        var _isHiding = true;


        var video = _p.video = document.getElementById( 'video' );

        var texture = new THREE.VideoTexture( video );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;

        _p.imageTextures =
        [
            texture,
            THREE.ImageUtils.loadTexture( "images/image_day_1.jpg" ),
            THREE.ImageUtils.loadTexture( "images/image_day_5.jpg" ),
            THREE.ImageUtils.loadTexture( "images/image_day_3.jpg" ),
            THREE.ImageUtils.loadTexture( "images/image_day_4.jpg" ),
            THREE.ImageUtils.loadTexture( "images/image_day_2.jpg" ),
            THREE.ImageUtils.loadTexture( "images/image_day_6.jpg" )
        ];



        var geometry = new THREE.PlaneBufferGeometry(_mapData.width, _mapData.height, 1, 1);

        var uniforms = _p.uniforms =
        {
            texture:      { type: "t", value: _p.imageTextures[0]},
            maskTexture:  { type: "t", value: _mapData.texture},
            opacity:      { type: "f", value: _p.settings.opacity},
            maskPower:    { type: "f", value: _p.settings["mask power"]},
            softPower:    { type: "f", value: 1}
        };

        var attributes = _p.attributes =
        {

        };

        var material = new THREE.ShaderMaterial
        ({
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: ShaderLoader.getShader("detail_map", "#vertex"),
            fragmentShader: ShaderLoader.getShader("detail_map", "#fragment"),
            transparent: true

        });

        //var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

        _p.object3D = new THREE.Mesh(geometry, material);

        _p.object3D.visible = false;

        /** public methods **/
        _p.setupGUI = function(rootGui)
        {
            var gui = rootGui.addFolder("Detail Map");
            //gui.open();

            var obj = _p.settings;

            gui.add(obj, "opacity", 0, 1).onChange(function(v)
            {
                _p.uniforms.opacity.value = v;
            });

            gui.add(obj, "mask power", 0, 1).onChange(function(v)
            {
                _p.uniforms.maskPower.value = v;
            });
        };

        _p.show = function(index)
        {
            if(_isHiding == false) return;
            _isHiding = false;

            _p.currentIndex = index;

            _p.uniforms.texture.value = _p.imageTextures[index];

            _p.object3D.visible = true;
            _p.uniforms.opacity.value = 0;

            if(index == 0) _p.video.play();

            TweenMax.killTweensOf(_p.uniforms.opacity);
            TweenMax.to(_p.uniforms.opacity,.6, {value:_p.settings.opacity});

        };

        _p.hide = function()
        {
            if(_isHiding) return;
            _isHiding = true;

            if(_p.currentIndex == 0) _p.video.pause();

            TweenMax.killTweensOf(_p.uniforms.opacity);
            TweenMax.to(_p.uniforms.opacity,.6, {value:.0, onComplete:function()
            {
                _p.object3D.visible = false;
            }});

        };
    };


}());
