/**
 * Created by sav on 2015/4/25.
 */
(function(){

    window.NodeMap = function(_scene)
    {
        var _p = this;



        _p.createLink = function(start, end)
        {
            var line = new LinkLine(start, end);

            _scene.add(line.object3D);

        };

        _p.createNode = function(position)
        {
            var node = new NodeCore(position);
            _scene.add(node.object3D);
        }
    };

    window.NodeMap.prototype.constructor = window.NodeMap;

}());

(function(){

    var _lineTexture = new THREE.ImageUtils.loadTexture("textures/sprites/link_line.png");

    window.LinkLine = function(start, end)
    {
        var _p = this;



        //console.log("create");

        var thickness = 2;
        var halfThickness = thickness*.5;
        var geometry = new THREE.Geometry();

        var dVec = end.clone().sub(start);
        var totalLength = dVec.length();

        //var arcHeight = 20;

        var arcHeight = totalLength * .25;

        var numSegments = Math.ceil(totalLength / 2);
        //var numSegments = 20;

        var x0, z0, x1, z1, vIndex = 0;


        var arcLength = 0;

        var dArc = Math.PI / numSegments;

        for(var i=0;i<numSegments;i++)
        {
            var arc0 = dArc * i;
            var arc1 = dArc * (i+1);

            var u0 = i/numSegments;
            var u1 = (i+1)/numSegments;


            x0 = -Math.cos(arc0) * totalLength*.5 + totalLength * .5;
            z0 = Math.sin(arc0) * arcHeight;

            x1 = -Math.cos(arc1) * totalLength*.5 + totalLength * .5;
            z1 = Math.sin(arc1) * arcHeight;

            var dx = x1 - x0;
            var dz = z1 - z0;
            arcLength += Math.sqrt(dx*dx + dz*dz);


            geometry.vertices.push
            (
                new THREE.Vector3(x0, halfThickness, z0),
                new THREE.Vector3(x1, halfThickness, z1),
                new THREE.Vector3(x0, -halfThickness, z0),
                new THREE.Vector3(x1, -halfThickness, z1)
            );

            geometry.faces.push
            (
                new THREE.Face3(vIndex+1, vIndex, vIndex+2),
                new THREE.Face3(vIndex+1, vIndex+2, vIndex+3)
            );

            geometry.faceVertexUvs[0].push(
                [
                    new THREE.Vector2(u1, 0),
                    new THREE.Vector2(u0, 0),
                    new THREE.Vector2(u0, 1)
                ],
                [
                    new THREE.Vector2(u1, 1),
                    new THREE.Vector2(u0, 0),
                    new THREE.Vector2(u1, 0)
                ]
            );

            vIndex += 4;
        }

        var uniforms = _p.uniforms =
        {
            texture:    { type:"t", value: _lineTexture },
            time:       { type:"f", value: 0 },
            thickness:  { type: "f", value: thickness },
            arcLength:  { type: "f", value: arcLength }
        };

        var attributes = _p.attributes =
        {

        };


        var material = _p.material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("link_line", "#vertex"),
                fragmentShader: ShaderLoader.getShader("link_line", "#fragment"),
                //blending: THREE.AdditiveBlending,
                transparent:true,
                depthTest: false,
                side: THREE.DoubleSide,
                wireframe:false
            });



        /*var material = new THREE.MeshBasicMaterial(
            {
                wireframe:true
                //map:_lineTexture,
                //transparent: true,
                //depthTest: false
            });*/




        var object3D = _p.object3D = new THREE.Mesh(geometry, material);

        var arc = Math.atan2(dVec.y, dVec.x);

        object3D.position.x = start.x;
        object3D.position.y = start.y;
        object3D.rotation.z = arc;

        //console.log("Arc = " + arc);

        //var duration = arcLength / 20;
        var duration = 1.6;

        var tl = new TimelineMax({repeat:-1});
        tl.set(uniforms.time, {value:0});
        tl.to(uniforms.time, duration, {value:2, ease:Power1.easeIn});

    };

    window.LinkLine.prototype.constructor = window.LinkLine;

}());

(function(){

    window.NodeCore = function(position)
    {
        var _p = this;

        var geometry = new THREE.Geometry();

        var vec = new THREE.Vector3(2, 0, 0);

        var numConer = 6;

        for(var i=0;i<=numConer;i++)
        {
            geometry.vertices.push(position.clone().add(vec));

            vec.applyAxisAngle(new THREE.Vector3(0,0,1), Math.PI*2 / numConer );
        }

        var material = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        _p.object3D = new THREE.Line( geometry, material );
    };

    window.NodeCore.prototype.constructor = window.NodeCore;

}());