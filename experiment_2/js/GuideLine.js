/**
 * Created by sav on 2015/4/22.
 */
(function(){

    window.GuideLine = function(_mapData, _scene)
    {
        var _p = this;

        var _lights = [];
        var _activedLights = [];
        var _numLights = 30;

        var _numRows = 0, _numCols = 0;
        var LINE_GAP = 40, THICKNESS = 2, HALF_THICKNESS = THICKNESS*.5;

        var width = Math.ceil(_mapData.width/LINE_GAP) * LINE_GAP * 2;
        var height = Math.ceil(_mapData.height/LINE_GAP) * LINE_GAP * 2;

        var startX = -width*.5, startY = -height*.5;

        buildLines();
        buildLights();

        _p.activeLights = function()
        {

            var tl = new TimelineMax({repeat:-1});
            activeOne();
            tl.add(activeOne,.3);

            //activeOne();

            function activeOne()
            {

                if(_lights.length)
                {
                    var light = _lights.pop();
                    var isVertical = Math.random() > .5;

                    var col, row;
                    var speed = 300, duration;

                    var startP, endP;
                    var flip = Math.random() > .5? 1: -1;

                    if(isVertical)
                    {
                        light.setDirection(true);

                        col = parseInt(Math.random()*_numCols*.5 + _numCols*.25) + 1;
                        row = 1;

                        startP = new THREE.Vector2(startX + col * LINE_GAP, startY + row * LINE_GAP);
                        startP.y *= flip;
                        endP = startP.clone();
                        endP.y = endP.y * -1;

                        duration = height / speed;
                    }
                    else
                    {
                        light.setDirection(false);

                        row = parseInt(Math.random()*_numRows*.5 + _numRows*.25) + 1;
                        col = 1;

                        startP = new THREE.Vector2(startX + col * LINE_GAP, startY + row * LINE_GAP);
                        startP.x *= flip;
                        endP = startP.clone();
                        endP.x = endP.x * -1;

                        duration = width / speed;

                    }

                    //console.log("col = " + col + ", row = " + row);

                    //console.log("duration = " + duration);

                    var tl = new TimelineMax();
                    tl.set(light.uniforms.progress, {value:0});
                    tl.set(light.object3D.position, {x: startP.x, y:startP.y});

                    tl.to(light.uniforms.progress, duration, {value: 1, ease:Linear.easeNone}, 0);
                    tl.to(light.object3D.position, duration, {x: endP.x, y:endP.y, ease:Linear.easeNone}, 0);

                    tl.add(function()
                    {
                       _lights.push(light);
                    });

                    _scene.add(light.object3D);
                }
            }
        };


        function buildLines()
        {
            var uniforms = _p.uniforms =
            {
                time:   { type:"f", value:0},
                color:  { type: "v3", value: new THREE.Vector3(1, 1, 1) }
            };

            var attributes = _p.attributes =
            {
                lineType:           { type:"f", value:[] }, // 0: top->down, 1: left->right
                progress:           { type: "f", value:[] },
                positionProgress:   { type: "f", value:[]}
            };

            //var material = new THREE.MeshBasicMaterial({wireframe:true});

            var material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("guide_line", "#line_vertex"),
                fragmentShader: ShaderLoader.getShader("guide_line", "#line_fragment"),
                blending: THREE.AdditiveBlending,
                transparent:true,
                depthTest: false
            });

            //var material = new THREE.LineBasicMaterial({opacity:.06, transparent: true});


            var geometry = _p.geometry = new THREE.Geometry();
            var x, y;
            var fIndex, quadIndex = 0;

            for(x=LINE_GAP;x<width;x+=LINE_GAP)
            {
               // addQuad(0, startX+x-HALF_THICKNESS, startY + height, startX+x+HALF_THICKNESS, startY);
                addLine(0, x, height, x, 0);
                _numCols ++;


            }

            for(y=LINE_GAP;y<height;y+=LINE_GAP)
            {
                //addQuad(1, startX, startY+y+HALF_THICKNESS, startX + width, startY+y-HALF_THICKNESS);
                addLine(1, 0, y, width, y);
                _numRows ++;
            }

            _p.object3D = new THREE.Line( geometry, material, THREE.LinePieces );
            //_p.object3D = new THREE.Mesh( geometry, material );
            //_p.object3D.position.z = -5;



            function addLine(type, left, top, right, bottom)
            {
                geometry.vertices.push(new THREE.Vector3(startX + left, startY + top, 0));
                geometry.vertices.push(new THREE.Vector3(startX + right, startY + bottom, 0));

                attributes.lineType.value.push(type);
                attributes.progress.value.push(0, 1);

                var positionProgress = type==0? left/width: top/height;
                attributes.positionProgress.value.push(positionProgress, positionProgress);

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

                var randomSeed = Math.random();
                var speed = Math.random() + .5;

                attributes.lineType.value.push(lineType, lineType, lineType, lineType);
                attributes.randomSeed.value.push(randomSeed, randomSeed, randomSeed, randomSeed);
                attributes.speed.value.push(speed, speed, speed, speed);

                quadIndex++;

            }
        }

        function buildLights()
        {
            var lightTexture = THREE.ImageUtils.loadTexture( "textures/sprites/guide_line_light.png" );


            for(var i=0;i<_numLights;i++)
            {
                _lights.push(new GuideLineLight(lightTexture, width, height));
            }
        }

    };

    window.GuideLine.prototype.constructor = window.GuideLine;

}());

(function(){

    window.GuideLineLight = function(texture, gridWidth, gridHeight)
    {
        var _p = this;

        var halfWidth = 1.6;
        var halfHeight = 16;

        var geometry = new THREE.Geometry();

        geometry.vertices.push
        (
            new THREE.Vector3(-halfWidth, halfHeight, 0),
            new THREE.Vector3(halfWidth, halfHeight, 0),
            new THREE.Vector3(-halfWidth, -halfHeight, 0),
            new THREE.Vector3(halfWidth, -halfHeight, 0)
        );

        geometry.faces.push
        (
            new THREE.Face3(1, 0, 2),
            new THREE.Face3(1, 2, 3)
        );

        geometry.faceVertexUvs[0].push
        (
            [
                new THREE.Vector2(1, 0),
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 1)
            ],
            [
                new THREE.Vector2(1, 0),
                new THREE.Vector2(0, 1),
                new THREE.Vector2(1, 1)
            ]
        );


        var uniforms = _p.uniforms =
        {
            alpha:      { type:"f", value:.3},
            texture:    { type:"t", value: texture },
            progress:   { type: "f", value: 0 }
        };

        var material = new THREE.ShaderMaterial
        ({
            uniforms: uniforms,
            vertexShader: ShaderLoader.getShader("guide_line", "#light_vertex"),
            fragmentShader: ShaderLoader.getShader("guide_line", "#light_fragment"),
            transparent: true,
            depthTest: false
        });


        _p.object3D = new THREE.Mesh(geometry, material);

        _p.setDirection = function(isVertical)
        {
            if(isVertical)
            {
                _p.object3D.rotation.z = 0;
            }
            else
            {
                _p.object3D.rotation.z = Math.PI * .5;
            }
        }


    };

    window.GuideLineLight.prototype.constructor = window.GuideLineLight;

}());