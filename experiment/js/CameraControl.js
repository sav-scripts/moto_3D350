/**
 * Created by sav on 2015/4/10.
 */
(function(){

    "use strict";

    window.CameraControl = function(_camera, _scene, _lookingTarget)
    {
        var _p = this;

        var cameraInitPosition = new THREE.Vector3(0, -400, 300);

        var options = {min:50, max:500};

        var objectControl = new ObjectControl(onUpdate);


        var cameraObj = {distance:300};

        var moveSpeed = 10;

        objectControl.add("mouseWheel", cameraObj, "distance", -50, options);
        objectControl.add("w", cameraObj, "distance", -moveSpeed, options);
        objectControl.add("s", cameraObj, "distance", moveSpeed, options);

        console.log(_lookingTarget.y);

        _p.updateDistance = updateDistance;

        //updateDistance();

        function updateDistance()
        {
            _camera.position.copy(cameraInitPosition);
            _camera.up = new THREE.Vector3(0,0,1);
            _camera.lookAt(_lookingTarget);

            var vec = _camera.position.clone().sub(_lookingTarget).normalize();

            //console.log("vec = " + vec.x + ", " + vec.y + ", " + vec.z);

            vec = vec.multiplyScalar(cameraObj.distance);

            vec = vec.add(_lookingTarget);

            _camera.position.copy(vec);

            /*
            _camera.position.copy(vec);
            _camera.position.normalize();
            _camera.position.multiplyScalar(cameraObj.distance);
            */

            //con

            /*
            return;

            var tz = cameraObj.zAspect * cameraObj.distance;
            var ty = cameraObj.yAspect * cameraObj.distance;
            var tx = 0;


            var dx = tx - _lookingTarget.x;
            var dy = ty - _lookingTarget.y;

            var ddistance = new THREE.Vector3(dx, dy, tz).length();

            //console.log("ddistance = " + ddistance);

            if(ddistance > cameraObj.distance)
            {


                //var n = Math.sqrt(Math.abs(1-dx*dx));
                var n = Math.sqrt(ty*ty / (dx*dx+dy*dy));

                //console.log("n = " + n);

                tx = _lookingTarget.x + dx * n;
                ty = _lookingTarget.y + dy * n;
            }

            _camera.position.x = tx;
            _camera.position.z = tz;
            _camera.position.y = ty;
            */

        }

        /*
        objectControl.add("w", _camera.position, "y", moveSpeed);
        objectControl.add("s", _camera.position, "y", -moveSpeed);
        objectControl.add("a", _camera.position, "x", moveSpeed);
        objectControl.add("d", _camera.position, "x", -moveSpeed);
        */

        //objectControl.add("w", _lookingTarget, "y", moveSpeed);
        //objectControl.add("s", _lookingTarget, "y", -moveSpeed);
        //objectControl.add("a", _lookingTarget, "x", moveSpeed);
        //objectControl.add("d", _lookingTarget, "x", -moveSpeed);

        //objectControl.add("w", _scene.position, "z", moveSpeed);
        //objectControl.add("s", _scene.position, "z", -moveSpeed);
        //objectControl.add("a", _scene.position, "x", moveSpeed);
        //objectControl.add("d", _scene.position, "x", -moveSpeed);

        objectControl.add("up", _scene.rotation, "x", -.02);
        objectControl.add("down", _scene.rotation, "x", .02);
        objectControl.add("left", _scene.rotation, "z", -.02);
        objectControl.add("right", _scene.rotation, "z", .02);

        function onUpdate()
        {

        }

    };
    window.CameraControl.prototype.constructor = window.CameraControl;


    window.ObjectControl = function(_onUpdate)
    {
        var _p = this;

        var _keyDowns = {};
        var _tlKeyboardUpdate = null;

        var _registedDic = {};

        init();

        function init()
        {
            createTLs();

            //console.log(_targetRotation);

            $(window).mousewheel(function(event, delta)
            {

                //var obj = _registedDic["mouseWheel"];
                if(!_registedDic["mouseWheel"]) return;

                handleEvent("mouseWheel", delta/Math.abs(delta));
            });


            var hammer = new Hammer(document, {  });
            hammer.on("pinchin", function(event)
            {
                handleEvent("mouseWheel", -.5);
            }).on("pinchout", function()
            {
                handleEvent("mouseWheel",.5);

            });




            $(window).on("keydown", function(event)
            {
                //console.log("key down: " + event.keyCode);

                var string = "key_" + event.keyCode;

                var value = _registedDic[string];
                if(value)
                {
                    _keyDowns[string] = true;
                    checkKeys();
                }
            });

            $(window).on("keyup", function(event)
            {
                var string = "key_" + event.keyCode;
                var value = _registedDic[string];
                if(value)
                {
                    delete  _keyDowns[string];
                    checkKeys();
                }
            });
        }

        function handleEvent(eventName, factor)
        {
            var array, obj, params, i;
            if(!factor) factor = 1;
            array = _registedDic[eventName];

            for(i=0;i<array.length;i++)
            {
                obj = array[i];
                obj.tweenObj[obj.valueName] += obj.delta * factor;
                if(obj.options.min && obj.tweenObj[obj.valueName] < obj.options.min) obj.tweenObj[obj.valueName] = obj.options.min;
                if(obj.options.max && obj.tweenObj[obj.valueName] > obj.options.max) obj.tweenObj[obj.valueName] = obj.options.max;

                params = {ease:Power2.easeOut};
                params[obj.valueName] = obj.tweenObj[obj.valueName];
                if(obj.options.onUpdate)
                {
                    params.onUpdate = obj.options.onUpdate;
                    params.onUpdateScope = obj.options.target;
                }

                TweenMax.to(obj.target,.5, params);
            }

        }

        function checkKeys()
        {
            var isAnyKeyDowns = false;
            var key;

            for (key in _keyDowns)
            {
                isAnyKeyDowns = true;
                break;
            }

            if (isAnyKeyDowns)
            {
                _tlKeyboardUpdate.resume();
            }
            else
            {
                _tlKeyboardUpdate.pause();
            }
        }

        function createTLs()
        {
            _tlKeyboardUpdate = new TimelineMax({repeat:-1, paused:true});
            _tlKeyboardUpdate.add(function()
            {
                var eventName;

                for(eventName in _keyDowns)
                {
                    handleEvent(eventName);
                }

            },.033);

        }

        _p.add = function(keyName, target, valueName, delta, options)
        {
            var string;

            if(keyName == "mouseWheel")
            {
                string = keyName;
            }
            else
            {
                var keyCode = window.KeyCodeDic[keyName];

                if(!keyCode)
                {
                    console.error("keyName: ["+keyName+"] code not remembed");
                    return;
                }

                string = "key_" + keyCode;
            }

            var tweenObj = target._cc_tweenObj;
            if(!tweenObj) tweenObj = target._cc_tweenObj = {};

            tweenObj[valueName] = target[valueName];

            var array = _registedDic[string];
            if(!array) array = _registedDic[string] = [];

            array.push(
            {
                keyName: keyName,
                target: target,
                valueName: valueName,
                tweenObj: tweenObj,
                delta: delta,
                options: options? options: {}
            });
        }
    };

    window.ObjectControl.prototype.constructor = window.ObjectControl;


    window.KeyCodeDic =
    {
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        w: 87,
        s: 83,
        a: 65,
        d: 68
    };

}());
