/**
 * Created by sav on 2015/4/22.
 */
(function(){

    window.BaseMap = function(_mapData)
    {
        var _p = this;

        //var texture = new THREE.Texture(_mapData.image);
        var texture = new THREE.ImageUtils.loadTexture("images/big_blank_white.png");
        texture.minFilter = THREE.LinearFilter;

        var geometry = new THREE.PlaneGeometry( _mapData.width, _mapData.height, 1, 1 );
        //geometry.wireframe = true;
        //var geometry = new THREE.PlaneBufferGeometry( _mapData.width, _mapData.height, 1, 1 );

        var uniforms = _p.uniforms =
        {
            texture:   { type: "t", value: texture },
            screenMouse: {type:"v2", value: new THREE.Vector2},
            projectedMouse: {type:"v3", value: new THREE.Vector3}
        };

        var attributes = _p.attributes =
        {
            //uv3:{type:"v2", value:[[0,0], [1,0], [0,1], [1,1]]}
        };

        var material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("map_0", "#vertex"),
                fragmentShader: ShaderLoader.getShader("map_0", "#fragment"),
                transparent:true
            });

        _p.geometry = geometry;

        _p.object3D = new THREE.Mesh( geometry, material );

    };

    window.BaseMap.prototype.constructor = window.BaseMap;

}());