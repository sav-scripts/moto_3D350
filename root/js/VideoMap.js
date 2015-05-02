/**
 * Created by sav on 2015/4/27.
 */
(function(){

    window.VideoMap = function(_mapData)
    {
        var _p = this;

        var video = document.getElementById( 'video' );

        var texture = new THREE.VideoTexture( video );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;

        var geometry = new THREE.PlaneBufferGeometry(_mapData.width, _mapData.height, 1, 1);

        var uniforms = _p.uniforms =
        {
            texture:    {type: "t", value: texture},
            maskTexture:{ type: "t", value: _mapData.texture},
            alpha:      {type: "f", value:.8}
        };

        var attributes = _p.attributes =
        {

        };

        var material = new THREE.ShaderMaterial
        ({
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: ShaderLoader.getShader("video_map", "#vertex"),
            fragmentShader: ShaderLoader.getShader("video_map", "#fragment"),
            transparent: true

        });

        //var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

        _p.object3D = new THREE.Mesh(geometry, material);
    };

    window.VideoMap.prototype.constructor = window.VideoMap;


}());
