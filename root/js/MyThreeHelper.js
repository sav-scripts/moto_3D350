/**
 * Created by sav on 2015/4/26.
 */
(function(){

    var _p = window.MyThreeHelper = {};

    _p.renderer = null;
    _p.camera = null;

    _p.test = function(position, renderer, camera, object3D)
    {
        var cameraDistance = CameraControl.instance.values.distance;

        console.log("position = " + position.x + ", " + position.y + ", " + position.z);


        console.log("camera distance = " + cameraDistance);


        var newDistance = _p.getCameraDistanceForPositions([position], true);

        TweenMax.to(CameraControl.instance.values,.5, {distance:newDistance});
    };

    _p.getCameraDistanceForPositions = function(positions, currentDistance, viewWidth, viewHeight, isGetMin, renderer, camera)
    {
        if(!renderer) renderer = _p.renderer;
        if(!camera) camera = _p.camera;
        if(viewWidth == null) viewWidth = window.innerWidth;
        if(viewHeight == null) viewHeight = window.innerHeight;

        var w = viewWidth * .5;
        var h = viewHeight * .5;
        //var array = [];

        //var newDistance = currentDistance;
        var newDistance = isGetMin? 10000000000: 0;

        for(var i=0;i<positions.length;i++)
        {
            var position = positions[i];

            var screenPosition = _p.worldToScreen(position, renderer, camera);
            var distance;

            distance = Math.max
            (
                currentDistance * Math.abs(screenPosition.x - w) / w,
                currentDistance * Math.abs(screenPosition.y - h) / h
            );

            newDistance = isGetMin? Math.min(distance, newDistance): Math.max(distance, newDistance);

            /*
            distance = currentDistance * Math.abs(screenPosition.y - window.innerHeight * .5) / (window.innerHeight *.5);
            newDistance = isGetMin? Math.min(distance, newDistance): Math.max(distance, newDistance);
            */
        }

        return newDistance;
    };

    // if fov is horizontal, then lengthOnScreen must be horizontal (width) too
    _p.getCameraDistanceForLength = function(fovRadian, lengthOnScreen)
    {
        return lengthOnScreen / (2 * Math.tan( fovRadian / 2 ));
    };

    _p.getFovRadians = function(camera)
    {
        var vRadians = camera.fov / 180 * Math.PI;

        var hRadians = 2 * Math.atan( Math.tan(  vRadians / 2  ) * camera.aspect );

        return {v: vRadians, h:hRadians};
    };

    _p.getVisableSize = function(camera, cameraDistance)
    {
        // vFOV is degree here
        var vFOV = camera.fov;
        var height = 2 * Math.tan( Math.PI * vFOV / 360 ) * cameraDistance;

        var aspect = camera.aspect;
        //var hFOV = 2 * Math.atan( Math.tan( Math.PI * vFOV / 360 ) * aspect );
        var hFOV_arc = 2 * Math.atan( Math.tan(  Math.PI * vFOV / 360  ) * aspect );
        //console.log("hFov = " + hFOV);
        var width  = 2 * Math.tan( hFOV_arc / 2 ) * cameraDistance;

        return {width: width, height: height};
    };

    _p.getWorldPosition = function(position, object3D)
    {
        object3D.updateMatrixWorld();
        var vector = position.clone();
        vector = vector.applyMatrix4(object3D.matrixWorld);

        return vector;
    };

    _p.worldToScreen = function(position, renderer, camera, cameraPosition)
    {
        var newCamera = camera;
        if(cameraPosition)
        {
            newCamera = new THREE.PerspectiveCamera( camera.fov, camera.aspect, camera.near, camera.far);
            newCamera.position.copy(cameraPosition);
            newCamera.updateMatrixWorld();
        }

        var vector = new THREE.Vector3();

        var obj = new THREE.Object3D();
        obj.position.x = position.x;
        obj.position.y = position.y;
        obj.position.z = position.z;

        var widthHalf = 0.5*renderer.context.canvas.width;
        var heightHalf = 0.5*renderer.context.canvas.height;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(newCamera);

        //if(cameraPosition) console.log(vector.z);

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;

        vector.x /= window.devicePixelRatio;
        vector.y /= window.devicePixelRatio;

        return vector;
    };

    _p.getCameraDistance = function(fov, contentWidth, contentHeight, containerWidth, containerHeight, bleedW, bleedH)
    {
        if(!containerWidth) containerWidth = window.innerWidth;
        if(!containerHeight) containerHeight = window.innerHeight;

        var targetWidth, targetHeight, height3D;

        var contentRate = contentHeight / contentWidth;
        var containerRate = (containerHeight-bleedH) / (containerWidth-bleedW);

        if(contentRate > containerRate)
        {
            //console.log("A");
            targetHeight = containerHeight - bleedH;
            targetWidth = targetHeight * contentWidth / contentHeight;

            height3D = contentHeight + bleedH * contentHeight / targetHeight;
        }
        else
        {
            //console.log("B");

            targetWidth = containerWidth - bleedW;
            targetHeight = targetWidth * contentHeight / contentWidth;

            height3D = containerHeight * ((contentWidth + bleedW * contentWidth / targetWidth) / containerWidth);
        }


        return {
            screenWidth: targetWidth,
            screenHeight: targetHeight,
            distance: height3D / 2 / Math.tan(Math.PI * fov / 360)
        };

    };

    _p.tweenOpacity = function(object3D, opacity, duration, ease)
    {
        if(!duration) duration = 0;

        if(opacity > 0) object3D.visible = true;

        if(!ease) ease = Power1.easeOut;

        TweenMax.killTweensOf(object3D.material.uniforms.opacity);

        TweenMax.to(object3D.material.uniforms.opacity, duration, {value:opacity, ease:ease, onComplete:function()
        {
            if(opacity == 0) object3D.visible = false;
        }});
        //TweenMax.to()

    };

}());