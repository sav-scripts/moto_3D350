/**
 * Created by sav on 2015/4/22.
 */
(function(){

    window.BaseMap = function(_mapData)
    {
        var _p = this;

        _p.settings =
        {
            alpha:.03
        };

        //var texture = new THREE.Texture(_mapData.image);
        var texture = _mapData.texture;

        //var geometry = new THREE.PlaneGeometry( _mapData.width, _mapData.height, 1, 1 );
        //geometry.wireframe = true;
        var geometry = new THREE.PlaneBufferGeometry( _mapData.width, _mapData.height, 1, 1 );

        var uniforms = _p.uniforms =
        {
            texture:   { type: "t", value: texture },
            screenMouse: {type:"v2", value: new THREE.Vector2},
            projectedMouse: {type:"v3", value: new THREE.Vector3},
            alpha:  {type:"f", value:_p.settings.alpha}
        };

        var attributes = _p.attributes =
        {
            //uv3:{type:"v2", value:[[0,0], [1,0], [0,1], [1,1]]}
        };

        var material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("base_map", "#vertex"),
                fragmentShader: ShaderLoader.getShader("base_map", "#fragment"),
                transparent:true
            });

        _p.geometry = geometry;

        _p.object3D = new THREE.Mesh( geometry, material );

        _p.setupGUI = function(rootGui)
        {
            var gui = rootGui.addFolder("Base Map");

            var obj = _p.settings;

            gui.add(obj, "alpha", 0,1).onChange(function(v)
            {
                _p.uniforms.alpha.value = v;
            });
        }

    };

    window.BaseMap.prototype.constructor = window.BaseMap;

}());