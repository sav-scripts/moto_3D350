/**
 * Created by sav on 2015/4/22.
 */
(function(){

    window.BaseMap = function(_mapData)
    {
        var _p = this;

        _p.settings =
        {
            "base map alpha":.015
        };

        //var texture = new THREE.Texture(_mapData.image);
        var texture = _mapData.texture;

        //var geometry = new THREE.PlaneGeometry( _mapData.width, _mapData.height, 1, 1 );
        //geometry.wireframe = true;
        var geometry = new THREE.PlaneBufferGeometry( _mapData.width, _mapData.height, 1, 1 );

        var uniforms = _p.uniforms =
        {
            opacity:    {type:"f", value:1},
            texture:   { type: "t", value: texture },
            screenMouse: {type:"v2", value: new THREE.Vector2},
            projectedMouse: {type:"v3", value: new THREE.Vector3},
            alpha:  {type:"f", value:_p.settings["base map alpha"]}
        };

        var attributes = _p.attributes =
        {
            //uv3:{type:"v2", value:[[0,0], [1,0], [0,1], [1,1]]}
        };

        var material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("misc", "#base_map_vertex"),
                fragmentShader: ShaderLoader.getShader("misc", "#base_map_fragment"),
                transparent:true,
                depthTest:false
            });

        _p.geometry = geometry;

        _p.object3D = new THREE.Mesh( geometry, material );

        _p.setupGUI = function(gui)
        {
            //var gui = rootGui.addFolder("Base Map");

            var obj = _p.settings;

            gui.add(obj, "base map alpha", 0,1).onChange(function(v)
            {
                _p.uniforms.alpha.value = v;
            });
        }

    };

    window.BaseMap.prototype.constructor = window.BaseMap;

}());

(function(){

    var _p = window.IntroText = {};

    _p.init = function(_scene)
    {
        _p.textures = [];

        _p.textures[0] = THREE.ImageUtils.loadTexture("images/intro_t01.png");
        _p.textures[1] = THREE.ImageUtils.loadTexture("images/intro_t02.png");

        //var geometry = new THREE.PlaneGeometry( _mapData.width, _mapData.height, 1, 1 );
        //geometry.wireframe = true;
        var geometry = new THREE.PlaneBufferGeometry( 512, 512, 1, 1 );

        var uniforms = _p.uniforms =
        {
            texture:   { type: "t", value: _p.textures[0] },
            opacity:    { type:"f", value: 1},
            twistPower: { type:"f", value:0}
        };

        var attributes = _p.attributes =
        {
            //uv3:{type:"v2", value:[[0,0], [1,0], [0,1], [1,1]]}
        };

        var material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("misc", "#intro_text_vertex"),
                fragmentShader: ShaderLoader.getShader("misc", "#intro_text_fragment"),
                transparent: true,
                depthTest: false
            });

        _p.geometry = geometry;

        _p.object3D = new THREE.Mesh( geometry, material );
        _scene.add(_p.object3D);
    };

    _p.changeText = function(index)
    {
        _p.uniforms.texture.value = _p.textures[index];
    };

}());