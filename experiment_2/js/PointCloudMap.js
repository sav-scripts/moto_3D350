/**
 * Created by sav on 2015/4/18.
 */
(function(){

    "use strict";

    window.PointCloudMap = function(_mapData, _scene)
    {
        var _p = this;

        _p.uniforms = null;
        _p.attributes = null;
        _p.dTime = .2;

        _p.settings =
        {
            "dot color": "#ffffff",
            "dot initialize": 1,
            "dot scale": 10.0,
            "dot texture": 0,
            "float speed":.05,
            "float scale":2,
            "inner alpha":.5,
            "outer alpha":.0
        };

        var _vertexDic = {};


        init();
        function init()
        {
            _p.dotTextures =
            [
                THREE.ImageUtils.loadTexture( "textures/sprites/dot_3.png" ),
                THREE.ImageUtils.loadTexture( "textures/sprites/dot_128x128.png" )
            ];

            var uniforms = _p.uniforms =
            {
                time:           { type: "f", value:0 },
                floatScale:     { type: "f", value: _p.settings["float scale"] },
                dotScale:       { type: "f", value: _p.settings["dot scale"] },
                dotColor:       { type: "v3", value: new THREE.Vector3(1,1,1) },
                texture:        { type: "t", value: _p.dotTextures[0] },
                screenMouse:    { type:"v2", value: new THREE.Vector2() },
                projectedMouse: { type:"v3", value: new THREE.Vector3() },
                innerAlpha:       { type:"f", value: _p.settings["inner alpha"] },
                outerAlpha:       { type:"f", value: _p.settings["outer alpha"] }
            };

            var attributes = _p.attributes = {

                size:           { type: 'f', value: [] },
                alpha:          { type: 'f', value: [] },
                randomSeed:     { type: 'f', value: [] },
                isEdge:         { type: "f", value: [] },
                floatCenter:    { type: "v3", value: [] }

            };

            //uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;


            var material = new THREE.ShaderMaterial( {

                uniforms:       uniforms,
                attributes:     attributes,
                vertexShader:   ShaderLoader.getShader("point_cloud_map", "#vertex"),
                fragmentShader: ShaderLoader.getShader("point_cloud_map", "#fragment"),

                //blending:       THREE.AdditiveBlending,
                depthTest:      false,
                transparent:    true

            });



            //var material = new THREE.PointCloudMaterial( { size:.5, vertexColors: true } );





            var geometry = _p.geometry = getGeometry();

            resetDotSize();

            _p.object3D = new THREE.PointCloud(geometry, material);
            _scene.add(_p.object3D);





            function getGeometry()
            {
                var geometry = new THREE.Geometry();

                var imageWidth = _mapData.image.width,
                    imageHeight = _mapData.image.height;

                var gap = 1;
                var left = -imageWidth*.5*gap;
                var top = imageHeight*.5*gap;

                var imageData = _mapData.ctx.getImageData(0,0,imageWidth,imageHeight);

                for(var h=0;h<imageHeight;h+=1)
                {
                    for(var w=0;w<imageWidth;w+=1)
                    {
                        //var color = imageData.data[(h*imageWidth+w)*4];


                        //if(color < 255)
                        if(testPixel(w, h) == 1)
                        {
                            var index = geometry.vertices.length;
                            var isEdge = testEdge(w, h);

                            if(!isEdge)
                            {
                                if(Math.random() > .3)  continue;
                            }

                            //if(isEdge) continue;

                            var tx = left + w*gap;
                            var ty = top - h*gap;

                            var vertex = new THREE.Vector3();
                            vertex.x = tx;
                            vertex.y = ty;
                            vertex.z = 0;

                            geometry.vertices[index] = vertex;

                            _vertexDic[tx + "_" + ty] =
                            {
                                index: index,
                                vertex: vertex
                            };


                            attributes.alpha.value.push(Math.random()*.9 + .1);
                            attributes.randomSeed.value.push(Math.random() *.5);
                            attributes.isEdge.value.push(isEdge? 1: 0);
                            attributes.floatCenter.value.push(new THREE.Vector3(0, 0, -1));

                        }
                    }
                }

                console.log("vertices count = " + geometry.vertices.length);




                return geometry;



                function testEdge(w, h)
                {
                    return  testPixel(w-1, h) == 0 || testPixel(w+1, h) == 0 || testPixel(w, h-1) == 0|| testPixel(w, h+1) == 0 ||
                            testPixel(w-1, h-1) == 0 || testPixel(w-1, h+1) == 0 || testPixel(w+1, h-1) == 0 || testPixel(w+1, h+1) == 0;
                }


                function testPixel(w, h)
                {
                    var index = (h*imageWidth+w)*4;

                    if(index < 0 || index >= imageData.data.length) return -1;

                    var color = new THREE.Color("rgb("+imageData.data[index]+","+imageData.data[index+1]+","+imageData.data[index+2]+")");

                    return (color.getHSL().l < .99)? 1: 0;

                }
            }


        }

        function resetDotSize()
        {
            var i;

            if(_p.settings["dot initialize"] == 0)
            {
                for(i=0;i<_p.geometry.vertices.length;i++)
                {
                    //_p.attributes.size.value[i] = (Math.random() *.9 + .1) * window.devicePixelRatio;
                    _p.attributes.size.value[i] = (Math.random() *.9 + .1);
                    _p.attributes.size.needsUpdate = true;
                }
            }
            else if(_p.settings["dot initialize"] == 1)
            {
                for(i=0;i<_p.geometry.vertices.length;i++)
                {
                    //_p.attributes.size.value[i] = Math.easeInQuart(Math.random() *.9 + .1, 0, 1, 1) * window.devicePixelRatio;
                    _p.attributes.size.value[i] = Math.easeInQuart(Math.random() *.9 + .1, 0, 1, 1);
                    _p.attributes.size.needsUpdate = true;
                }
            }
        }


        _p.setupGUI = function(rootGui)
        {
            var gui = rootGui.addFolder("Point Cloud Map");
            //gui.open();

            var obj = _p.settings;

            gui.add(obj, "dot initialize", {"linear size":0, "quart size": 1}).onChange(function(v)
            {
                resetDotSize();
            });

            gui.addColor(obj, "dot color").onChange(function(c)
            {
                _p.uniforms.dotColor.value = getRGB(c);
            });

            gui.add(obj, "dot scale", 0.1, 10).listen().onChange(function(v)
            {
               _p.uniforms.dotScale.value = Math.round(v);
            });

            gui.add(obj, "dot texture", 0, 1).listen().onChange(onDotTextureChange);

            function onDotTextureChange(v)
            {
                v = Math.round(v);
                obj["dot texture"] = v;
                _p.uniforms.texture.value = _p.dotTextures[v];

                /*
                if(v == 0)
                {
                    obj["dot scale"] = _p.uniforms.dotScale.value = 1;
                }
                else if(v==1)
                {
                    obj["dot scale"] = _p.uniforms.dotScale.value = 5;
                }
                */

            }

            gui.add(obj, "float speed",.002, 1);

            gui.add(obj, "float scale",.0, 100).onChange(function(v)
            {
                _p.uniforms.floatScale.value = v;
            });

            gui.add(obj, "inner alpha", 0, 1).onChange(function(v)
            {
                _p.uniforms.innerAlpha.value = v;
            });

            gui.add(obj, "outer alpha", 0, 1).onChange(function(v)
            {
                _p.uniforms.outerAlpha.value = v;
            });

            function getRGB(c)
            {
                c = parseInt("0x" + c.substr(1));

                return new THREE.Vector3
                (
                    ((c >> 16) & 255)/255,
                    ((c >> 8) & 255)/255,
                    (c & 255)/255
                );

            }

            onDotTextureChange(1);
        };

        _p.update = function(screenMouse, projectedMouse)
        {
            _p.uniforms.time.value += _p.settings["float speed"];
            _p.uniforms.screenMouse.value.x = screenMouse.x;
            _p.uniforms.screenMouse.value.y = window.innerHeight - screenMouse.y;

            if(projectedMouse) _p.uniforms.projectedMouse.value = projectedMouse;
        };

        _p.addNode = function(position)
        {
            var r = 6;

            var cx = parseInt(position.x);
            var cy = parseInt(position.y);
            var x, y, left = cx-r, bottom = cy - r, right = cx+r, top = cy + r;

            //console.log("cx = " + cx + ", cy = " + cy);

            var count = 0;

            for(y=bottom; y<top; y++)
            {
                for(x=left; x<right; x++)
                {
                    var obj = _vertexDic[x + "_" + y];
                    if(!obj) continue;

                    var dx = x - cx, dy = y - cy;
                    var distance = dx*dx + dy*dy;
                    if(distance > r*r) continue;

                    count ++;

                    _p.attributes.floatCenter.value[obj.index] = new THREE.Vector3(position.x, position.y, r);


                }
            }

            if(count > 0) _p.attributes.floatCenter.needsUpdate = true;

            //console.log("count = " + count);
        };



    };

    window.PointCloudMap.prototype.constructor = window.PointCloudMap;

}());