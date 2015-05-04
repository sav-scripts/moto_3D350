/**
 * Created by sav on 2015/4/10.
 */
(function(){

    "use strict";

    var _p = window.Main =
    {
        isLocking: true,
        inVideoMode: false,
        videoWidth: 1280,
        videoHeight: 720,
        videoWidthBleed: 20,
        videoHeightBleed: 180,
        currentMode: null
    };

    _p.getVideoViewSetting = function()
    {
        return MyThreeHelper.getCameraDistance(45, Main.videoWidth, Main.videoHeight, window.innerWidth, window.innerHeight, Main.videoWidthBleed, Main.videoHeightBleed);
    };

    _p.onWindowResize = onWindowResize;

    _p.optionCitys = [];
    _p.routeCitys = [];

    _p.toRouteMode = function()
    {

    };

    _p.toVoteMode = function()
    {

        SceneAnime.instance.switchMapContent(true);

        //Main.viewToCurrentCity();
        Main.viewToCurrentCity();
    };

    _p.viewToCurrentCity = function(cb)
    {
        _p.viewToCity(_p.currentCityIndex, function()
        {
            _p.fitCameraWithCitys(cb);
        });
    };

    _p.viewToCity = function(cityIndex, cb)
    {
        var obj = Main.city_data[cityIndex];
        var position = new THREE.Vector3(obj.position.x, obj.position.y, 0);


        CameraControl.instance.lookTo(position,.5, cb);

    };

    _p.fitCameraWithCitys = function(cb)
    {
        var i, cityObj, positions = [];
        for(i=0;i<Main.optionCitys.length;i++)
        {
            cityObj = Main.optionCitys[i];

            positions.push(cityObj.position);
        }

        var cameraDistance = CameraControl.instance.values.distance;
        var newDistance = MyThreeHelper.getCameraDistanceForPositions(positions, cameraDistance, window.innerWidth - 60, window.innerHeight - 140);

        //console.log("new Distance = " + newDistance);

        if(newDistance != cameraDistance)
        {
            TweenMax.to(CameraControl.instance.values, 1, {distance:newDistance, ease:Power1.easeInOut, onComplete:function()
            {
                CameraControl.instance.updateValues();
                if(cb) cb.apply();
            }});
        }
        else
        {
            if(cb) cb.apply();
        }
    };



    /** settings **/
    var CAMERA_SETTING;

    function applySetting()
    {
        CAMERA_SETTING =
        {
            //initPosition: new THREE.Vector3(0, -600, 300),
            fov:45,
            near:1,
            far:5500
        };
    }

    /** params **/

    var _stats, _mapData = Main.mapData = {};

    var _camera, _renderer, _scene, _cameraControl;
    var _windowHalfW, _windowHalfH, WIDTH, HEIGHT;

    var _screenMouse = {x:0, y:0};
    var _projectedMouse = null;
    var _ndcMouse = new THREE.Vector2();

    var _raycaster;
    var _threshold = 0.1;

    var _mapPath = "images/big_blank.png";

    var _testPlane;
    var _baseMap, _pointMap, _nodeMap, _sceneAnime;

    var _datGUI;

    var _showui = false;



    /** init **/
    Main.init = function()
    {
        if(Utility.urlParams.showui == "1") _showui = true;

        applySetting();


        getWorldMapData(function()
        {
            ShaderLoader.load(["misc", "point_cloud_map", "guide_line", "node_map", "detail_map"], function()
            {
                _pointMap = new PointCloudMap(_mapData, _scene, function()
                {
                    getVoteData(function()
                    {
                        CityLabels.init(function()
                        {
                            ConfirmDialog.init();
                            TimelineUI.init();
                            TopUI.init();
                            IndexIntro.init();
                            build();
                        });
                    });
                });
            });
        });

        VideoPlayer.init();

    };

    function getVoteData(cb)
    {
        //var url = "../document/server_api

        /** test **/
        Main.currentData = window.FakeData.get_vote_data.recive_data;

        if(cb) cb.apply();
    };

    function build()
    {
        //onWindowResize();

        setupStats();




        _scene = new THREE.Scene();

        _camera = new THREE.PerspectiveCamera( CAMERA_SETTING.fov, WIDTH / HEIGHT, CAMERA_SETTING.near, CAMERA_SETTING.far);

        window.camera = _camera;

        //_cameraControl = new DefaultCameraControl(_camera, CAMERA_SETTING.initPosition);
        //_camera.position.z = 500;

        _renderer = new THREE.WebGLRenderer({ antialiasing: true, alpha:true });
        _renderer.setPixelRatio(window.devicePixelRatio);
        _renderer.setClearColor( 0x333333,.2);

        MyThreeHelper.camera = _camera;
        MyThreeHelper.renderer = _renderer;

        //document.body.appendChild(_renderer.domElement);
        $(".city_label_layer").before(_renderer.domElement);



        var obj =
        {
            background: $("body").css("background-color"),
            "show city name": true
        };

        _datGUI = new dat.GUI(
            {
                load:{
            "remembered": {
                "Default": {
                    "0": {
                        "dot initialize": 1,
                        "dot color": "#ffffff",
                        "dot scale": 9.9,
                        "dot texture": 1,
                        "float speed": 0.05,
                        "float scale": 2,
                        "inner alpha": 0.5,
                        "outer alpha": 0
                    }
                },
                "Setting A": {
                    "0": {
                        "dot initialize": 0,
                        "dot color": "#ffffff",
                        "dot scale": 1.5,
                        "dot texture": 0,
                        "float speed": 0.05,
                        "float scale": 1,
                        "inner alpha": 0.24260255195829905,
                        "outer alpha": 0.9080133828389575
                    }
                }
            },
            "preset": "Default",
            "closed": true,
            "folders": {
                "Basic": {
                    "preset": "Default",
                    "closed": true,
                    "folders": {}
                },
                "Point Cloud Map": {
                    "preset": "Default",
                    "closed": true,
                    "folders": {}
                },
                "Node Link Line": {
                    "preset": "Default",
                    "closed": true,
                    "folders": {}
                },
                "camera": {
                    "preset": "Default",
                    "closed": true,
                    "folders": {}
                }
            }
        }});

        if(!_showui) $(_datGUI.domElement).detach();
        setupTrace();
        var folder = _datGUI.addFolder("Basic");
        folder.addColor(obj, "background").onChange(function(v)
        {
            $("body").css("background-color", v);
        });
        folder.add(obj, "show city name").onChange(function(v)
        {
            var string = v? "block": "none";
            $(".city_label_layer").css("display", string);
        });


        trace("pixel ratio = " + window.devicePixelRatio);

        _p.detailMap = new DetailMap(_mapData);
        _p.detailMap.setupGUI(_datGUI);
        _scene.add(_p.detailMap.object3D);



        _p.guideLine = new GuideLine(_mapData, _scene);
        _scene.add(_p.guideLine.object3D);

        _baseMap = new BaseMap(_mapData);
        //_baseMap.setupGUI(folder);
        _scene.add(_baseMap.object3D);



        IntroText.init(_scene);

        setupMouseTestPlane();


        _pointMap.setupGUI(_datGUI);
        _scene.add(_pointMap.object3D);


        _nodeMap = new NodeMap(_scene, _renderer, _camera);
        _nodeMap.setupGUI(_datGUI);

        setupNodes();




        _raycaster = new THREE.Raycaster();
        _raycaster.params.PointCloud.threshold = _threshold;





        _cameraControl = new CameraControl(_camera, _scene);


        _sceneAnime = new SceneAnime(_pointMap, _cameraControl, _p.guideLine, _baseMap, _nodeMap);


        var dom = $(".loading_icon")[0];
        TweenMax.to(dom,.6, {alpha:0, onComplete:function()
        {
            $(dom).detach();
        }});





        //_sceneAnime.playIntro();

        //_datGUI.close();


        //_datGUI.preset = "Setting A";


        window.addEventListener("resize", onWindowResize, false);
        onWindowResize();

        render();


        /** start **/


        if(Utility.urlParams.skipintro == 1)
        {
            introComplete();
        }
        else
        {
            _sceneAnime.toFirstCut();
            triggerIntro();

            //$(window).on("mousedown", triggerIntro);
        }

        function triggerIntro(event)
        {
            if(event && event.target != _renderer.domElement) return;

            $(window).unbind("mousedown", triggerIntro);
            _sceneAnime.playIntro(introComplete);
        }

        function introComplete()
        {
            _scene.remove(IntroText.object3D);

            $(window).on("mousedown", onMousedown);
            $(window).on("mousemove", onMousemove);

            _p.guideLine.activeLights();

            _nodeMap.isLocking = false;

            TimelineUI.show();
            TopUI.show();



            SceneAnime.instance.switchMapContent(false, 0);

            IndexIntro.show();
        }

        function render()
        {
            requestAnimationFrame(render);

            _cameraControl.updateDistance();

            if(_p.guideLine)
            {
                _p.guideLine.uniforms.time.value += .002;
            }

            if(_baseMap)
            {
                _baseMap.uniforms.screenMouse.value.x = _screenMouse.x;
                _baseMap.uniforms.screenMouse.value.y = window.innerHeight - _screenMouse.y;
            }

            if(_pointMap) _pointMap.update(_screenMouse, _projectedMouse);

            if(_nodeMap) _nodeMap.update();

            _renderer.render(_scene, _camera);
            _stats.update();
        }
    }

    function setupNodes()
    {
        var citys = [];

        var routeArray = Main.currentData.event_route;

        var centerIndex;

        var i, cityIndex, obj, optionObj, totalVotes = 0, voteWeight, cityObj;

        for(i=0;i<routeArray.length;i++)
        //for(i=0;i<=17;i++)
        {
            cityIndex = routeArray[i];
            //cityIndex = i;
            obj = Main.city_data[cityIndex];


            cityObj = addCity(new THREE.Vector3(obj.position.x, obj.position.y, 0), obj.name_en, obj.name_ch, true, cityIndex);
            citys.push(cityObj);
            Main.routeCitys.push(cityObj);

            if(i > 0)
            {
                addLink(i-1, i, 30, true);
            }

            if(i == routeArray.length-1)
            {
                Main.currentCityIndex = cityIndex;
                centerIndex = citys.length - 1;
            }
        }

        for(i=0;i<Main.currentData.options.length;i++)
        {
            optionObj = Main.currentData.options[i];
            totalVotes += optionObj.num_votes;
        }


        for(i=0;i<Main.currentData.options.length;i++)
        {
            optionObj = Main.currentData.options[i];
            voteWeight = optionObj.num_votes / totalVotes;

            cityIndex = optionObj.city_index;

            obj = Main.city_data[cityIndex];

            cityObj = addCity(new THREE.Vector3(obj.position.x, obj.position.y, 0), obj.name_en, obj.name_ch, false, cityIndex, obj.num_votes, voteWeight);
            citys.push(cityObj);
            Main.optionCitys.push(cityObj);

            var numLinks = 20 + parseInt(500 * voteWeight);

            addLink(centerIndex, citys.length-1, numLinks);

            //console.log("city: " + obj.name_ch + ", num votes: " + optionObj.num_votes + ", vote weight: " + totalVotes);
        }


        function addCity(position, englishName, chineseName, isOld, cityIndex, votes, voteWeight)
        {
            var obj = {position: position, votes:votes, voteWeight:voteWeight};
            _nodeMap.createNode(position, englishName, chineseName, isOld, cityIndex);

            return obj;
        }

        function addLink(startIndex, endIndex, num, isOld)
        {
            var startPosition = citys[startIndex].position;
            var endPosition = citys[endIndex].position;

            _nodeMap.createLink(startPosition, endPosition, num, isOld);
        }
    }

    function setupTrace()
    {
        var obj = {debug:""};

        _datGUI.add(obj, "debug").listen();

        window.trace = function(message)
        {
            obj.debug = message;
        };
    }

    function rotateAroundObjectAxis(object, axis, radians)
    {
        var rotObjectMatrix;
        rotObjectMatrix = new THREE.Matrix4();
        rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

        object.matrix.multiply(rotObjectMatrix);
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    function setupMouseTestPlane()
    {
        //var testGeometry = new THREE.PlaneGeometry( _mapData.width, _mapData.height, 1, 1 );
        var testGeometry = new THREE.PlaneBufferGeometry( _mapData.width*2, _mapData.height*2, 1, 1 );
        var testMarterial = new THREE.MeshBasicMaterial({wireframe:true, visible: false});
        _testPlane = new THREE.Mesh(testGeometry, testMarterial);
        _scene.add(_testPlane);
    }



    function onMousemove(event)
    {
        if(CameraControl.instance.isLocking) return;
        if(event.target != _renderer.domElement) return;
        updateMousePosition(event.clientX, event.clientY);

        /*
        var point = mouseHitTest();

        if(point)
        {
            var mat4 = _testPlane.matrixWorld.clone();
            mat4 = mat4.getInverse(mat4);

            _projectedMouse = point.applyMatrix4(mat4);
        }
        */
    }

    function onMousedown(event)
    {
        if(CameraControl.instance.isLocking) return;
        if(event.target != _renderer.domElement) return;
        //_screenMouse = new THREE.Vector2(event.clientX, event.clientY);
        updateMousePosition(event.clientX, event.clientY);

        //console.log("click on: " + event.clientX + ", " + event.clientY);

        testHit();

        function testHit()
        {
            var point = mouseHitTest();

            if(point)
            {
                var mat4 = _testPlane.matrixWorld.clone();
                mat4 = mat4.getInverse(mat4);

                var oldMouse = _projectedMouse;

                //console.log("point = " + point.x + ", " + point.y);

                _projectedMouse = point.clone().applyMatrix4(mat4);

                //console.log("projectedMouse = " + _projectedMouse.x + ", " + _projectedMouse.y + ", " + _projectedMouse.z);


                /*
                _nodeMap.createNode(_projectedMouse);

                if(oldMouse)
                {
                    _nodeMap.createLink(oldMouse, _projectedMouse);

                }

                _pointMap.addNode(_projectedMouse);
                */

                //_lookingCenter = point;

                _cameraControl.lookTo(_projectedMouse);

                //MyThreeHelper.test(_projectedMouse, _renderer, _camera, _testPlane);
            }

        }

        //screenProjectToScene(event.clientX, event.clientY);
        //console.log(_camera.position);
    }

    function updateMousePosition(tx, ty)
    {
        _screenMouse.x = tx;
        _screenMouse.y = ty;

        onUpdate();

        //TweenMax.killTweensOf(_screenMouse);
        //TweenMax.to(_screenMouse,.25, {x:tx, y:ty, ease:Power1.easeOut, onUpdate:onUpdate});

        function onUpdate()
        {
            _ndcMouse.x = _screenMouse.x/window.innerWidth*2 - 1;
            _ndcMouse.y = -_screenMouse.y/window.innerHeight*2 + 1;
        }
    }

    function mouseHitTest()
    {
        _raycaster.setFromCamera(_ndcMouse, _camera);
        var intersection = _raycaster.intersectObject(_testPlane);

        return (intersection.length > 0)? intersection[0].point: null;

    }



    function onWindowResize()
    {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;

        _windowHalfW = WIDTH / 2;
        _windowHalfH = HEIGHT / 2;

        if(_camera && _renderer)
        {
            _camera.aspect = WIDTH / HEIGHT;
            _camera.updateProjectionMatrix();

            _renderer.setSize( WIDTH, HEIGHT );
        }

        var obj;

        if(_cameraControl)
        {
            obj = Main.getVideoViewSetting();

            var width = obj.screenWidth;
            var height = obj.screenHeight;

            var left = (window.innerWidth - width) * .5;
            var top = (window.innerHeight - height) * .5;

            $("#video_player").css("width", width).css("height", height).css("left", left).css("top", top);
        }


        if(obj && Main.inVideoMode)
        {
            _cameraControl.values.distance = obj.distance;

        }

        TimelineUI.onResize();

    }


    /** handle world map source **/
    function getWorldMapData(cb)
    {
        var canvas = _mapData.canvas = document.createElement("canvas");
//            canvas.width = 200;
//            canvas.height = 200;

        canvas.style.position = 'absolute';
        canvas.style.zIndex = 1000;

        var ctx = _mapData.ctx = canvas.getContext("2d");

        //canvas.loadim


        var image = _mapData.image = new Image();

        image.onload = function()
        {
            _mapData.width = canvas.width = image.width;
            _mapData.height = canvas.height = image.height;

            $(canvas).width(image.width).height(image.height).css("bottom", 0);


            ctx.drawImage(image, 0, 0);

            if(cb) cb.apply();
        };

        image.src = _mapPath;

        _mapData.texture = new THREE.ImageUtils.loadTexture(_mapPath);
        _mapData.texture.minFilter = THREE.LinearFilter;


//            document.body.appendChild( canvas );
    }

    /** misc **/
    function setupStats()
    {

        _stats = new Stats();
        _stats.domElement.style.position = 'absolute';
        _stats.domElement.style.top = '0px';
        _stats.domElement.style.zIndex = 999;
        if(_showui) document.body.appendChild( _stats.domElement );
    }

}());