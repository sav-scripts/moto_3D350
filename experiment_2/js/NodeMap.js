/**
 * Created by sav on 2015/4/25.
 */
(function(){

    window.NodeMap = function(_scene, _renderer, _camera)
    {
        var _p = this;

        var _nodeList = [];

        _p.createLink = function(start, end)
        {
            var line = new LinkLine(start, end);

            _scene.add(line.object3D);

        };

        _p.createNode = function(position, string)
        {
            var node = new NodeCore(position);
            _scene.add(node.object3D);

            var nodeLabel = new NodeLabel(string);

            _nodeList.push(
            {
                node: node,
                position: position,
                label: nodeLabel
            });
        };

        _p.update = function()
        {
            for(var i=0;i<_nodeList.length;i++)
            {
                var obj = _nodeList[i];

                var screenPosition = MyThreeHelper.worldToScreen(obj.position, _renderer, _camera);

                $(obj.label.domElement).css("left", screenPosition.x).css("top", screenPosition.y);

            }
        };
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
        object3D.position.z = 4;
        object3D.rotation.z = arc;

        //console.log("Arc = " + arc);

        //var duration = arcLength / 20;
        var duration = 2.1;

        var tl = new TimelineMax({repeat:-1});
        tl.set(uniforms.time, {value:0});
        tl.to(uniforms.time, duration, {value:2, ease:Power1.easeIn});

        tl.progress(Math.random());

    };

    window.LinkLine.prototype.constructor = window.LinkLine;

}());

(function(){

    window.NodeCore = function(position)
    {
        var _p = this;

        var _pen =
        {
            position: null
        };

        var uniforms = _p.uniforms =
        {
            time:       { type:"f", value: 0},
            color:      { type:"v3", value: new THREE.Vector3(1.0, 1.0, 1.0) },
            maxAlpha:      { type:"f", value:.6 },
            minAlpha:      { type:"f", value:.13 },
            center:     { type:"v3", value: position.clone() },
            numVertices:    { type: "f", value:0}
        };

        var attributes = _p.attributes =
        {
            index:  { type:"f", value:[] }
        };

        var material = new THREE.ShaderMaterial(
        {
            uniforms: _p.uniforms,
            attributes: _p.attributes,
            vertexShader: ShaderLoader.getShader("node_line", "#vertex"),
            fragmentShader: ShaderLoader.getShader("node_line", "#fragment"),
            //blending: THREE.AdditiveBlending,
            transparent:true,
            depthTest: false,
            side: THREE.DoubleSide

        });

        var geometry = new THREE.Geometry();

        var vec = new THREE.Vector3(2, 0, 2);

        var numConer = 4;
        var dArc = Math.PI*2/numConer;
        var axis = new THREE.Vector3(0,0,1);

        var top = new THREE.Vector3(position.x, position.y, 4);
        var bottom = new THREE.Vector3(position.x, position.y, 0);

        for(var i=0;i<=numConer;i++)
        {
            var v0 = vec.clone().applyAxisAngle(axis, dArc*i).add(position);
            var v1 = vec.clone().applyAxisAngle(axis, dArc*(i+1)).add(position);

            moveTo(v0);
            lineTo(v1);
            lineTo(top);
            lineTo(v0);
            lineTo(bottom);
            lineTo(v1);
        }

        uniforms.numVertices.value = geometry.vertices.length;

        _p.object3D = new THREE.Line( geometry, material, THREE.LinePieces );


        var duration = 4;

        var tl = new TimelineMax({repeat:-1});
        tl.set(_p.uniforms.time, {value:0});
        tl.to(_p.uniforms.time, duration, {value:1, ease:Linear.easeNone});

        function lineTo(target)
        {
            var index = geometry.vertices.length;
            attributes.index.value.push(index, index+1);

            geometry.vertices.push(_pen.position, target);

            _pen.position = target;
        }

        function moveTo(target)
        {
            _pen.position = target;
        }
    };

    window.NodeCore.prototype.constructor = window.NodeCore;

}());

(function(){

    window.NodeLabel = function(_string)
    {
        var _p = this;

        var dom = _p.domElement = document.createElement('div');
        dom.className = "city_name";
        dom.innerHTML = _string;

        $(".city_label_layer").append(dom);

        $(dom).css("margin-left", -$(dom).width() *.5);
    };

    window.NodeLabel.prototype.constructor = window.NodeLabel;

}());