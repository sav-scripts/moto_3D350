/**
 * Created by sav on 2015/4/10.
 */
(function(){

    "use strict";

    window.Main = {};


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

    var _stats, _mapData = {};

    var _camera, _renderer, _scene, _cameraControl, _lookingCenter = new THREE.Vector3(0, 0, 0);
    var _windowHalfW, _windowHalfH, WIDTH, HEIGHT;

    var _screenMouse = {x:0, y:0};
    var _projectedMouse = new THREE.Vector3(0,0,0);
    var _ndcMouse = new THREE.Vector2();

    var _raycaster;
    var _threshold = 0.1;

    var _mapPath = "images/big_blank.png";

    var _testPlane;
    var _baseMap, _pointMap, _guideLine;

    var _datGUI;

    /** init **/
    Main.init = function()
    {
        applySetting();

        setupStats();

        getWorldMapData(function()
        {
            ShaderLoader.load(["map_0", "point_cloud_map", "quad_cloud_map", "guide_line"], build);
        });

    };

    function build()
    {
        //onWindowResize();






        _scene = new THREE.Scene();

        _camera = new THREE.PerspectiveCamera( CAMERA_SETTING.fov, WIDTH / HEIGHT, CAMERA_SETTING.near, CAMERA_SETTING.far);

        window.camera = _camera;

        //_cameraControl = new DefaultCameraControl(_camera, CAMERA_SETTING.initPosition);
        //_camera.position.z = 500;

        _renderer = new THREE.WebGLRenderer({ antialiasing: true, alpha:true });
        _renderer.setPixelRatio(window.devicePixelRatio);
        _renderer.setClearColor( 0x333333,.2);
        document.body.appendChild(_renderer.domElement);


        var obj =
        {
            background: $("body").css("background-color")
        };

        _datGUI = new dat.GUI();
        setupTrace();
        var folder = _datGUI.addFolder("Basic");
        folder.addColor(obj, "background").onChange(function(v)
        {
            $("body").css("background-color", v);
        });

        trace("pixel ratio = " + window.devicePixelRatio);





        //_baseMap = new BaseMap(_mapData);
        //_scene.add(_baseMap.object3D);


        setupMouseTestPlane();

        _pointMap = new PointCloudMap(_mapData, _scene);
        _pointMap.setupGUI(_datGUI);
        _scene.add(_pointMap.object3D);


        //_guideLine = new GuideLine(_mapData);
        //_scene.add(_guideLine.object3D);

        _raycaster = new THREE.Raycaster();
        _raycaster.params.PointCloud.threshold = _threshold;





        //var cc = new THREE.OrbitControls(_camera, _renderer.domElement);

        //var controls = new THREE.MouseControls(_camera);
        //controls.minDistance = -1000;


        window.addEventListener("resize", onWindowResize, false);
        onWindowResize();

        $(window).on("mousedown", onMousedown);
        $(window).on("mousemove", onMousemove);



        //_camera.position.x = CAMERA_SETTING.initPosition.x;
        //_camera.position.y = CAMERA_SETTING.initPosition.y;
        //_camera.position.z = CAMERA_SETTING.initPosition.z;
        //_camera.lookAt(_lookingCenter);

        _camera.position.y = -300;
        _camera.position.z = 400;

        folder = _datGUI.addFolder("camera");
        folder.add(_camera.position, "x").listen();
        folder.add(_camera.position, "y").listen();
        folder.add(_camera.position, "z").listen();
        //folder.open();




        //_camera.lookAt(_lookingCenter);

        var arc = Math.atan2(-_camera.position.y, _camera.position.z);

        //console.log("arc = " + arc);

        rotateAroundObjectAxis(_camera, new THREE.Vector3(1,0,0), arc);
        //_camera.rotateOnAxis(new THREE.Vector3(1,0,0), Math.);
        //console.log(_camera.rotation.toVector3());

        //new ObjectControl(_scene);
        _cameraControl = new CameraControl(_camera, _scene, _lookingCenter);

        render();



        function render()
        {
            requestAnimationFrame(render);

            if(_guideLine)
            {
                _guideLine.uniforms.time.value += .002;
            }





            if(_baseMap)
            {
                _baseMap.uniforms.screenMouse.value.x = _screenMouse.x;
                _baseMap.uniforms.screenMouse.value.y = window.innerHeight - _screenMouse.y;
                _baseMap.uniforms.projectedMouse.value = _projectedMouse;
            }

            if(_pointMap) _pointMap.update(_screenMouse, _projectedMouse);

            _cameraControl.updateDistance();

            //_camera.rotation.reorder("YZX");

            //console.log(_camera.rotation);

            //myLookAt();

            _renderer.render(_scene, _camera);
            _stats.update();
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
        var testGeometry = new THREE.PlaneBufferGeometry( _mapData.width, _mapData.height, 1, 1 );
        var testMarterial = new THREE.MeshBasicMaterial({wireframe:true, visible: false});
        _testPlane = new THREE.Mesh(testGeometry, testMarterial);
        _scene.add(_testPlane);
    }



    function onMousemove(event)
    {
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
        if(event.target != _renderer.domElement) return;
        //_screenMouse = new THREE.Vector2(event.clientX, event.clientY);
        updateMousePosition(event.clientX, event.clientY);

        testMove();

        function testMove()
        {
            var point = mouseHitTest();

            if(point)
            {
                var mat4 = _testPlane.matrixWorld.clone();
                mat4 = mat4.getInverse(mat4);

                _projectedMouse = point.applyMatrix4(mat4);

                //_lookingCenter = point;
                TweenMax.to(_lookingCenter, 1, {x:point.x, y:point.y, z:point.z, ease:Power1.easeInOut});
            }

        }

        //screenProjectToScene(event.clientX, event.clientY);
        //console.log(_camera.position);
    }

    function testMouse()
    {

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


//            document.body.appendChild( canvas );
    }

    /** misc **/
    function setupStats()
    {

        _stats = new Stats();
        _stats.domElement.style.position = 'absolute';
        _stats.domElement.style.top = '0px';
        _stats.domElement.style.zIndex = 999;
        document.body.appendChild( _stats.domElement );
    }

}());