/**
 * Created by sav on 2015/4/22.
 */
(function(){

    window.GuideLine = function(_mapData)
    {
        var _p = this;


        //var texture = new THREE.Texture(_mapData.image);
        //var texture = new THREE.ImageUtils.loadTexture("images/big_blank_white.png");
        //texture.minFilter = THREE.LinearFilter;


        var uniforms = _p.uniforms =
        {
        };

        var attributes = _p.attributes =
        {
            lineType:{type:"f", value:[]} // 0: top->down, 1: left->right
        };

        //var material = new THREE.MeshBasicMaterial({wireframe:true});
        var material = new THREE.ShaderMaterial(
        {
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: ShaderLoader.getShader("guide_line", "#vertex"),
            fragmentShader: ShaderLoader.getShader("guide_line", "#fragment"),
            blending: THREE.AdditiveBlending,
            transparent:true,
            depthTest: false

        });


        var geometry = _p.geometry = new THREE.Geometry();

        var LINE_GAP = 20, THICKNESS = 1, HALF_THICKNESS = THICKNESS*.5;

        var width = Math.ceil(_mapData.width/LINE_GAP) * LINE_GAP;
        var height = Math.ceil(_mapData.height/LINE_GAP) * LINE_GAP;

        var x, y, startX = -width*.5, startY = -height*.5;
        var fIndex, quadIndex = 0;

        for(x=LINE_GAP;x<width;x+=LINE_GAP)
        {
            addQuad(0, startX+x-HALF_THICKNESS, startY + height, startX+x+HALF_THICKNESS, startY);
        }


        for(y=LINE_GAP;y<height;y+=LINE_GAP)
        {
            addQuad(1, startX, startY+y+HALF_THICKNESS, startX + width, startY+y-HALF_THICKNESS);
        }

        function addQuad(lineType, left, top, right, bottom)
        {
            fIndex = quadIndex*4;

            geometry.vertices.push
            (
                new THREE.Vector3(left, bottom, 0),
                new THREE.Vector3(right, bottom, 0),
                new THREE.Vector3(left, top, 0),
                new THREE.Vector3(right, top, 0)
            );

            geometry.faces.push(
                new THREE.Face3(fIndex+3, fIndex+2, fIndex),
                new THREE.Face3(fIndex+1, fIndex+3, fIndex)
            );

            geometry.faceVertexUvs[0].push(
                [
                    new THREE.Vector2(1,0),
                    new THREE.Vector2(0,0),
                    new THREE.Vector2(0,1)
                ],
                [
                    new THREE.Vector2(1,1),
                    new THREE.Vector2(1,0),
                    new THREE.Vector2(0,1)
                ]
            );

            attributes.lineType.value.push(lineType, lineType, lineType, lineType);

            quadIndex++;

        }

        _p.object3D = new THREE.Mesh( geometry, material );

    };

    window.GuideLine.prototype.constructor = window.GuideLine;

}());