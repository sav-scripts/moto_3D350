/**
 * Created by sav on 2015/4/10.
 */
(function(){

    "use strict";

    window.CameraControl = function(_camera, _scene)
    {
        var _p = window.CameraControl.instance = this;

        //_p.isLocking = false;

        var _isLocking = false;
        var _objectControl = new ObjectControl();

        _p.lookingCenter = new THREE.Vector3(0, 0, 0);

        var cameraInitPosition = _p.cameraInitPosition = new THREE.Vector3(0, -600, 600);

        var options = _p.settings = {min:50, max:1400};



        var values = _p.values = {distance:600};


        _objectControl.add("mouseWheel", values, "distance", -50, options);
        /*
        _objectControl.add("w", values, "distance", -moveSpeed, options);
        _objectControl.add("s", values, "distance", moveSpeed, options);
        */

        _objectControl.add("w", _scene.rotation, "x",.1);
        _objectControl.add("s", _scene.rotation, "x", -.1);

        _objectControl.add("a", _scene.rotation, "y",.1);
        _objectControl.add("d", _scene.rotation, "y", -.1);


        /*
         var moveSpeed = 10;

         _objectControl.add("w", _camera.position, "y", moveSpeed);
         _objectControl.add("s", _camera.position, "y", -moveSpeed);
         _objectControl.add("a", _camera.position, "x", moveSpeed);
         _objectControl.add("d", _camera.position, "x", -moveSpeed);

        //_objectControl.add("w", _p.lookingCenter, "y", moveSpeed);
        //_objectControl.add("s", _p.lookingCenter, "y", -moveSpeed);
        //_objectControl.add("a", _p.lookingCenter, "x", moveSpeed);
        //_objectControl.add("d", _p.lookingCenter, "x", -moveSpeed);

        //_objectControl.add("w", _scene.position, "z", moveSpeed);
        //_objectControl.add("s", _scene.position, "z", -moveSpeed);
        //_objectControl.add("a", _scene.position, "x", moveSpeed);
        //_objectControl.add("d", _scene.position, "x", -moveSpeed);

         */

        _objectControl.add("up", cameraInitPosition, "z", 10);
        _objectControl.add("down", cameraInitPosition, "z", -10);
        _objectControl.add("left", cameraInitPosition, "x", -10);
        _objectControl.add("right", cameraInitPosition, "x", 10);


        /** public methods **/
        _p.updateDistance = function()
        {
            _camera.position.copy(cameraInitPosition);
            _camera.up = new THREE.Vector3(0,0,1);
            _camera.lookAt(_p.lookingCenter);

            var vec = _camera.position.clone().sub(_p.lookingCenter).normalize();

            //console.log("vec = " + vec.x + ", " + vec.y + ", " + vec.z);

            vec = vec.multiplyScalar(values.distance);

            vec = vec.add(_p.lookingCenter);

            _camera.position.copy(vec);

        };

        _p.lock = function()
        {
            _isLocking = true;
            _objectControl.isLocking = true;
        };

        _p.unlock = function()
        {
            _isLocking = false;
            _objectControl.isLocking = false;
        };

        _p.updateValues = function()
        {
            _objectControl.updateValues();
        };



    };
    window.CameraControl.prototype.constructor = window.CameraControl;


    window.ObjectControl = function()
    {
        var _p = this;

        _p.isLocking = false;

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

        /** public methods **/
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
        };

        _p.updateValues = function()
        {
            var eventName, array, i, obj;

            for(eventName in _registedDic)
            {
                array = _registedDic[eventName];
                for(i=0;i<array.length;i++)
                {
                    obj = array[i];

                    obj.tweenObj[obj.valueName] = obj.target[obj.valueName];
                }
            }
        };


        /** private methods **/
        function handleEvent(eventName, factor)
        {
            if(_p.isLocking) return;

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
