/**
 * Created by sav on 2015/4/16.
 */
(function(){

    "use strict";

    window.QuadCloudMap = function(_mapData, _scene, _datGUI)
    {
        var _p = this;

        _p.uniforms = null;
        _p.attributes = null;

        _p.quadDic = {};

        var DOT_GAP = 1;
        var QUAD_SIZE = 1;
        var HALF_QUAD_SIZE = QUAD_SIZE * .5;

        init();
        function init()
        {
            /** set texture **/
            var texture = new THREE.ImageUtils.loadTexture("textures/sprites/dot_128x128.png");
            //var texture = new THREE.ImageUtils.loadTexture("images/big_blank_white.png");

            var uniforms = _p.uniforms =
            {
                time: {type:"f", value:0},
                mapWidth: {type:"f", value:_mapData.width},
                mapHeight: {type:"f", value:_mapData.height},
                dotMode: {type:"i", value: 2},
                dotColor: {type:"v3", value: new THREE.Vector3(1,.8,.0)},
                trailColor: {type:"v3", value: new THREE.Vector3(1,.5,.5)},
                trailLength: {type:"f", value: 100},
                QUAD_SIZE: {type:"f", value: QUAD_SIZE},
                HALF_QUAD_SIZE: {type:"f", value: HALF_QUAD_SIZE},
                texture:   { type: "t", value: texture },
                rotation: {type: "v4", value: new THREE.Vector4(0, 0, 0, 1)},
                rotationMatrixInverse: {type:"m4", value: new THREE.Matrix4()},
                projectedMouse: {type:"v3", value: new THREE.Vector3}
            };

            var attributes = _p.attributes =
            {
                vectorIndex: {type:"f", value:[]},
                quadIndex: {type:"i", value:[]},
                trailValue: {type:"f", value:[]}
                //uv3:{type:"v2", value:[[0,0], [1,0], [0,1], [1,1]]}
            };

            /** set gemoetry **/
            var geometry = getGemoetry(attributes);
            //var geometry = new THREE.PlaneGeometry(100,100,1,1);




/*
            var material = new THREE.MeshBasicMaterial(
                {
                    map:texture,
                    blending:       THREE.AdditiveBlending,
                    transparent: true,
                    depthTest: false,
                    wireframe:true
                });
                */

            var material = _p.material = new THREE.ShaderMaterial(
            {
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: ShaderLoader.getShader("quad_cloud_map", "#vertex"),
                fragmentShader: ShaderLoader.getShader("quad_cloud_map", "#fragment"),
                blending: THREE.AdditiveBlending,
                transparent:true,
                depthTest: false
                //wireframe:true
            });

            _p.object3D = new THREE.Mesh(geometry, material);





            function getGemoetry(attributes)
            {
                var geometry = new THREE.Geometry();

                var imageWidth = _mapData.image.width,
                    imageHeight = _mapData.image.height;

                var gap = 1;
                var left = -imageWidth*.5*gap;
                var top = imageHeight*.5*gap;

                var imageData = _mapData.ctx.getImageData(0,0,imageWidth,imageHeight);

                var centerVertices = [];

                var quadIndex = 0;

                for(var h=0;h<imageHeight;h+=DOT_GAP)
                {
                    for(var w=0;w<imageWidth;w+=DOT_GAP)
                    {
                        //var color = imageData.data[(h*imageWidth+w)*4];

                        var index = (h*imageWidth+w)*4;

                        var color = new THREE.Color("rgb("+imageData.data[index]+","+imageData.data[index+1]+","+imageData.data[index+2]+")");

                        //if(color < 255)
                        if(color.getHSL().l < .99)
                        {
                            //var vertex = new THREE.Vector3();
                            var cx = left + w*gap;
                            var cy = top - h*gap;

                            //vertex.z = 0;

                            var vIndex = quadIndex*4;

                            _p.quadDic[cx + "_" + cy] = quadIndex;

                            _p.attributes.vectorIndex.value.push(0, 1, 2, 3);
                            _p.attributes.quadIndex.value.push(quadIndex, quadIndex, quadIndex, quadIndex);
                            _p.attributes.trailValue.value.push(0, 0, 0, 0);

                            geometry.vertices.push(
                                new THREE.Vector3(cx-HALF_QUAD_SIZE, cy+HALF_QUAD_SIZE, 0),
                                new THREE.Vector3(cx+HALF_QUAD_SIZE, cy+HALF_QUAD_SIZE, 0),
                                new THREE.Vector3(cx-HALF_QUAD_SIZE, cy-HALF_QUAD_SIZE, 0),
                                new THREE.Vector3(cx+HALF_QUAD_SIZE, cy-HALF_QUAD_SIZE, 0)
                            );

                            geometry.faces.push(
                                new THREE.Face3(vIndex+1, vIndex, vIndex+2),
                                new THREE.Face3(vIndex+1, vIndex+2, vIndex+3)
                            );

                            geometry.faceVertexUvs[0].push(
                                [
                                    new THREE.Vector2(1,0),
                                    new THREE.Vector2(0,0),
                                    new THREE.Vector2(0,1)
                                ],
                                [
                                    new THREE.Vector2(1,0),
                                    new THREE.Vector2(0,1),
                                    new THREE.Vector2(1,1)
                                ]
                            );

                            var center = new THREE.Vector3(cx, cy, 0);

                            centerVertices.push(center, center, center, center);


                            quadIndex ++;
                            //geometry.vertices.push( vertex );
                        }
                    }
                }

                attributes.center = {type:"v3", value:centerVertices};

                console.log("quad index = " + quadIndex);
                console.log("vertices count = " + geometry.vertices.length);

                //setVertices(geometry);
                return geometry;
            }
        }


        _p.setupGUI = function(gui)
        {
            var obj =
            {
                "dot scale mode":_p.uniforms.dotMode.value,
                "dot color": "#ffcc00",
                "trail color": "#ff8888",
                "wireframe": false
            };

            gui.add(obj, 'dot scale mode', 0.0, 2, 1).onChange(function(v)
            {
                _p.uniforms.dotMode.value = Math.round(v);
            });


            gui.add(obj, "wireframe").onChange(function()
            {
                if(obj.wireframe)
                {
                    _p.material.wireframe = true;
                    _p.material.blending = THREE.NormalBlending;
                    _p.material.transparent = false;

                    //transparent:true,
                }
                else
                {
                    _p.material.wireframe = false;
                    _p.material.blending = THREE.AdditiveBlending;
                    _p.material.transparent = true;
                    //_p.transparent = true;
                }
            });

            gui.addColor(obj, "dot color").onChange(function(c)
            {
                _p.uniforms.dotColor.value = getRGB(c);
            });

            gui.addColor(obj, "trail color").onChange(function(c)
            {

                _p.uniforms.trailColor.value = getRGB(c);
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
        }
    };

    window.QuadCloudMap.prototype.constructor = window.QuadCloudMap;

}());