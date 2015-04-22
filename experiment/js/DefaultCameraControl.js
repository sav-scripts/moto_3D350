/**
 * Created by sav on 2015/4/10.
 */
(function(){

    "use strict";

    window.DefaultCameraControl = DefaultCameraControl;

    function DefaultCameraControl(_camera, initPosition)
    {
        var _p = window.DefaultCameraControl.prototype = this;
        var _zoomRate = 25;

        var _currentSetting =
        {
          x:0, y:0, z:0
        };

        var _keyDowns = {};
        var _isAnyKeyDowns = false;
        var _tlKeyboardUpdate = null;

        init();

        function init()
        {

            if(!initPosition) initPosition = new THREE.Vector3(0,0,1000);

            createTLs();

            _camera.position.x = _currentSetting.x = initPosition.x;
            _camera.position.y = _currentSetting.y = initPosition.y;
            _camera.position.z = _currentSetting.z = initPosition.z;

            $(window).mousewheel(function(event, delta)
            {
               //console.log("event = " + delta);
                _currentSetting.z += -delta*_zoomRate;

                TweenLite.to(_camera.position,.3, {z:_currentSetting.z});
            });


        }

        function initKeyboard()
        {
            $(window).on("keydown", function(event)
            {
                //console.log("key code: " + event.keyCode);
                switch(event.keyCode)
                {
                    case 87: _keyDowns.up = true;
                        break;
                    case 83: _keyDowns.down = true;
                        break;
                    case 65: _keyDowns.left = true;
                        break;
                    case 68: _keyDowns.right = true;
                        break;
                }

                checkKeys();

            });

            $(window).on("keyup", function(event)
            {
                //console.log("key code: " + event.keyCode);
                switch(event.keyCode)
                {
                    case 87: delete  _keyDowns.up;
                        break;
                    case 83: delete  _keyDowns.down;
                        break;
                    case 65: delete  _keyDowns.left;
                        break;
                    case 68: delete  _keyDowns.right;
                        break;
                }

                checkKeys();
            });
        }

        function checkKeys()
        {
            _isAnyKeyDowns = false;

            for (var key in _keyDowns)
            {
                _isAnyKeyDowns = true;
                break;
            }

            if (_isAnyKeyDowns)
            {
                _tlKeyboardUpdate.resume();
            }
            else
            {
                //console.log("no key down");
                _tlKeyboardUpdate.pause();
            }

        }

        function createTLs()
        {
            _tlKeyboardUpdate = new TimelineMax({repeat:-1, paused:true});
            _tlKeyboardUpdate.add(function()
            {
                console.log("check");

            },.033);

        }
    }

    window.ObjectControl = ObjectControl;

    function ObjectControl(_target)
    {
        var _p = window.ObjectControl.prototype = this;

        var _keyDowns = {};
        var _tlKeyboardUpdate = null;

        var _targetRotation = new THREE.Vector3(0,0,0);
        var _targetPosition = new THREE.Vector3(0,0,0);

        var _keyDic =
        {
            38:"up",
            40:"down",
            37:"left",
            39:"right",
            87:"w",
            83:"s",
            65:"a",
            68:"d"
        };

        init();

        function init()
        {
            createTLs();

            _targetRotation = _target.rotation.clone();
            _targetPosition = _target.position.clone();

            //console.log(_targetRotation);

            $(window).on("keydown", function(event)
            {
                //console.log("key down: " + event.keyCode);

                var value = _keyDic[event.keyCode];
                if(value)
                {
                    _keyDowns[value] = true;
                    checkKeys();
                }


            });

            $(window).on("keyup", function(event)
            {
                var value = _keyDic[event.keyCode];
                if(value)
                {
                    delete  _keyDowns[value];
                    checkKeys();
                }
            });
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
                var d = .02;
                if(_keyDowns.up) _targetRotation.x -= d;
                if(_keyDowns.down) _targetRotation.x += d;
                if(_keyDowns.left) _targetRotation.z += d;
                if(_keyDowns.right) _targetRotation.z -= d;

                TweenMax.to(_target.rotation,.5, {x:_targetRotation.x, y:_targetRotation.y, z:_targetRotation.z, ease:Power2.easeOut});

                d = 3;
                if(_keyDowns.w) _targetPosition.z += d;
                if(_keyDowns.s) _targetPosition.z -= d;
                if(_keyDowns.a) _targetPosition.x += d;
                if(_keyDowns.d) _targetPosition.x -= d;

                TweenMax.to(_target.position,.5, {x:_targetPosition.x, y:_targetPosition.y, z:_targetPosition.z, ease:Power2.easeOut});

            },.033);

        }
    }

}());
