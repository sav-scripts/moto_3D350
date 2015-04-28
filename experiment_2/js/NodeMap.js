/**
 * Created by sav on 2015/4/25.
 */
(function(){

    window.NodeMap = function(_scene, _renderer, _camera)
    {
        var _p = this;

        _p.settings =
        {
            "line speed":2,
            "head alpha":.7,
            "tail alpha":.25,
            "tail length": 50
        };


        var _sampleDom = $(".city_label")[0];
        $(_sampleDom).css("display", "none");

        var _nodeList = [];

        var texture = THREE.ImageUtils.loadTexture("textures/sprites/guide_line_light.png");

        var uniforms =
        {
            size:       {type:"f", value:30},
            texture:    {type:"t", value:texture},
            normalColor:    {type:"v4", value:new THREE.Vector4(1,0,0,1)},
            oldColor:    {type:"v4", value:new THREE.Vector4(1,0,0,.35)}
        };

        var attributes =
        {
            nodeType:   {type:"f", value:[]}
        };



        var geometry = new THREE.Geometry;
        var material = new THREE.ShaderMaterial
        ({
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: ShaderLoader.getShader("node_map", "#node_vertex"),
            fragmentShader: ShaderLoader.getShader("node_map", "#node_fragment"),
            //blending: THREE.AdditiveBlending,
            transparent:true,
            depthTest: false
        });

        /*
        var material = new THREE.PointCloudMaterial
        ({
            map: texture,
            transparent: true,
            depthTest: false,
            color: 0xff0000,
            size: 30,
            blending: THREE.AdditiveBlending
        });
        */

        _p.object3D = new THREE.PointCloud(geometry, material);
        _scene.add(_p.object3D);

        var _linkLine = new LinkLine(_p.settings);
        _scene.add(_linkLine.object3D);


        _p.createNode = function(position, englishName, chineseName, isOld)
        {
            geometry.vertices.push(position.clone());

            attributes.nodeType.value.push(isOld? 1: 0);


            var nodeLabel = new NodeLabel(_sampleDom, englishName, chineseName, isOld);

            _nodeList.push(
                {
                    position: position,
                    label: nodeLabel
                });
        };

        _p.createLink = function(start, end, num, isOld)
        {
            if(!num) num = parseInt(1 + Math.random()*10)*10;

            var i;

            for(i=0;i<num;i++)
            {
                _linkLine.addLine(start, end, isOld);

                //_lineLineList.push(line);
            }


        };

        _p.update = function()
        {
            for(var i=0;i<_nodeList.length;i++)
            {
                var obj = _nodeList[i];

                var screenPosition = MyThreeHelper.worldToScreen(obj.position, _renderer, _camera);

                $(obj.label.domElement).css("left", screenPosition.x - obj.label.width *.5).css("top", screenPosition.y + 14);

            }
        };

        _p.setupGUI = function(rootGui)
        {
            var gui = rootGui.addFolder("Node Link Line");
            //gui.open();

            var obj = _p.settings;

            gui.add(obj, "line speed", 1, 100).onChange(updateLineSettings);
            gui.add(obj, "head alpha", 0, 1).onChange(updateLineSettings);
            gui.add(obj, "tail alpha", 0, 1).onChange(updateLineSettings);
            gui.add(obj, "tail length", 0, 200).onChange(updateLineSettings);

            function updateLineSettings()
            {
                _linkLine.updateSettings(_p.settings);
            }
        };
    };

    window.NodeMap.prototype.constructor = window.NodeMap;

}());

(function(){

    window.LinkLine = function(settings)
    {
        var _p = this;

        var uniforms = _p.uniforms =
        {
            speed:       { type:"f", value:settings["line speed"] },
            time:       { type:"f", value: 0 },
            arcLength:  { type: "f", value: 0 },
            headAlpha:  { type:"f", value: settings["head alpha"] },
            tailAlpha:  { type:"f", value: settings["tail alpha"] },
            tailLength:  { type:"f", value: settings["tail length"] }
        };

        var attributes = _p.attributes =
        {
            progress:   {type:"f", value:[]},
            randomSeed:   {type:"f", value:[]},
            isOld:      {type:"f", value:[]}
        };


        var material = _p.material = new THREE.ShaderMaterial
        ({
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: ShaderLoader.getShader("node_map", "#link_line_vertex"),
            fragmentShader: ShaderLoader.getShader("node_map", "#link_line_fragment"),
            blending: THREE.AdditiveBlending,
            transparent:true,
            depthTest: false,
            side: THREE.DoubleSide
        });


        var geometry = new THREE.Geometry();

        _p.object3D = new THREE.Line(geometry, material, THREE.LinePieces);



        var _tl = new TimelineMax({repeat:-1});
        _tl.add(function()
        {
            _p.uniforms.time.value += .033;
        },.033);

        _p.addLine = function(start, end, isOld)
        {
            var dVec = end.clone().sub(start);

            var zArc = Math.atan2(dVec.y, dVec.x);

            var totalLength = dVec.length();

            //var arcHeight = 20;

            var arcHeight = totalLength * .25;

            var numSegments = Math.ceil(totalLength / 2);
            //var numSegments = 20;


            var x0, y0, z0, x1, z1, y1;
            var haflRandomRange = 5;
            var yRandom = (Math.random()*2 - 1)*haflRandomRange;
            arcHeight += (Math.random() * 2 - 1) * haflRandomRange;

            var randomSeed = Math.random();

            /*
            if(isOld)
            {
                arcHeight = 0;
                yRandom = 0;
            }
            */


            var arcLength = 0;

            var dArc = Math.PI / numSegments;

            var axis = new THREE.Vector3(0,0,1);

            var isOldValue = isOld? 1: 0;

            for(var i=0;i<numSegments;i++)
            {
                var arc0 = dArc * i;
                var arc1 = dArc * (i+1);


                var u0 = i/numSegments;
                var u1 = (i+1)/numSegments;

                y0 = yRandom * (1-Math.abs(u0 * 2 - 1));
                y1 = yRandom * (1-Math.abs(u1 * 2 - 1));


                x0 = -Math.cos(arc0) * totalLength*.5 + totalLength * .5;
                z0 = Math.sin(arc0) * arcHeight;

                x1 = -Math.cos(arc1) * totalLength*.5 + totalLength * .5;
                z1 = Math.sin(arc1) * arcHeight;

                var dx = x1 - x0;
                var dz = z1 - z0;
                arcLength += Math.sqrt(dx*dx + dz*dz);

                var vec0 = new THREE.Vector3(x0, y0, z0);
                var vec1 = new THREE.Vector3(x1, y1, z1);

                vec0.applyAxisAngle(axis, zArc);
                vec1.applyAxisAngle(axis, zArc);

                vec0.add(start);
                vec1.add(start);

                geometry.vertices.push(vec0, vec1);
                attributes.progress.value.push(u0, u1);

                attributes.randomSeed.value.push(randomSeed, randomSeed);
                attributes.isOld.value.push(isOldValue, isOldValue);


                /*
                if(isOldLine)
                {
                    attributes.randomSeed.value.push(Math.random(), Math.random());
                }
                else
                {
                    attributes.randomSeed.value.push(randomSeed, randomSeed);
                }
                */
            }

            uniforms.arcLength.value = arcLength;


            //var material = new THREE.LineBasicMaterial({color:0xffffff});




            /*
            var arc = Math.atan2(dVec.y, dVec.x);

            object3D.position.x = start.x;
            object3D.position.y = start.y;
            object3D.position.z = 0;
            object3D.rotation.z = arc;
            */


        };

        _p.updateSettings = function(settings)
        {
            _p.uniforms.speed.value = settings["line speed"];
            _p.uniforms.headAlpha.value = settings["head alpha"];
            _p.uniforms.tailAlpha.value = settings["tail alpha"];
            _p.uniforms.tailLength.value = settings["tail length"];
        };


    };

    window.LinkLine.prototype.constructor = window.LinkLine;

}());


    (function(){

    window.NodeLabel = function(sample, englishName, chineseName)
    {
        var _p = this;

        var dom = _p.domElement = $(sample).clone();
        $(dom).css("display", "block");
        $(".city_label_layer").append(dom);

        var $cityName = $(dom).find(".city_name");
        var $basement = $(dom).find(".basement");

        $(dom).find(".name_en").text(englishName);
        $(dom).find(".name_ch").text(chineseName);

        _p.width = $cityName.width() + 40;

        $(dom).width(_p.width);
        $basement.width(_p.width - 8);
        $cityName.css("left", "50%").css("margin-left", -_p.width *.5 + 20);


    };

    window.NodeLabel.prototype.constructor = window.NodeLabel;

}());