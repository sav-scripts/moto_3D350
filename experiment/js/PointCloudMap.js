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


        init();
        function init()
        {

            var attributes = _p.attributes = {

                size: {	type: 'f', value: [] },
                ca:   {	type: 'c', value: [] }

            };

            var uniforms = _p.uniforms = {

                amplitude: { type: "f", value: 1.0 },
                color:     { type: "c", value: new THREE.Color( 0xffffff ) },
                texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "textures/sprites/dot_2.png" ) },
                screenMouse: {type:"v2", value: new THREE.Vector2()},
                projectedMouse: {type:"v3", value: new THREE.Vector3()}

            };

            uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;


            var material = new THREE.ShaderMaterial( {

                uniforms:       uniforms,
                attributes:     attributes,
                vertexShader:   ShaderLoader.getShader("point_cloud_map", "#vertex"),
                fragmentShader: ShaderLoader.getShader("point_cloud_map", "#fragment"),

                blending:       THREE.AdditiveBlending,
                depthTest:      false,
                transparent:    true

            });



            //var material = new THREE.PointCloudMaterial( { size:.5, vertexColors: true } );





            var geometry = getGeometry();

            var pointClouds = _p.pointClouds = new THREE.PointCloud(geometry, material);
            _scene.add(pointClouds);


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

                        var index = (h*imageWidth+w)*4;

                        var color = new THREE.Color("rgb("+imageData.data[index]+","+imageData.data[index+1]+","+imageData.data[index+2]+")");

                        //if(color < 255)
                        if(color.getHSL().l < .99)
                        {
                            var vertex = new THREE.Vector3();
                            vertex.x = left + w*gap;
                            vertex.y = top - h*gap;
                            vertex.z = 0;

                            geometry.vertices.push( vertex );
                        }
                    }
                }

                console.log("vertices count = " + geometry.vertices.length);

                setVertices(geometry);


                return geometry;
            }

            function setVertices(geometry)
            {
                var vertices = geometry.vertices;

                var values_size = attributes.size.value;
                var values_color = attributes.ca.value;

                for ( var v = 0; v < vertices.length; v ++ ) {

                    values_size[ v ] = 1;

                    values_color[ v ] = new THREE.Color( 0xffffff );
                    //values_color[ v ].setHSL( 0.5 + 0.2 * ( v / vc1 ), 1, 0.5 );
                    values_color[v].setHSL(48/360, 1,.5);
                }

                return geometry;
            }

        }






    };

    window.PointCloudMap.prototype.constructor = window.PointCloudMap;

}());