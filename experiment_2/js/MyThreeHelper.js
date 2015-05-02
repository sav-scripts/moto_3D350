/**
 * Created by sav on 2015/4/26.
 */
(function(){

    var _p = window.MyThreeHelper = {};

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

    _p.getCameraDistance = function(fov, contentWidth, contentHeight, containerWidth, containerHeight, bleed)
    {
        if(!containerWidth) containerWidth = window.innerWidth;
        if(!containerHeight) containerHeight = window.innerHeight;

        var rawContentWidth = contentWidth;
        var rawContentHeight = contentHeight;

        contentWidth = contentWidth + bleed;
        contentHeight = contentHeight + bleed;

        var targetWidth, targetHeight, height3D;

        var contentRate = contentHeight / contentWidth;
        var containerRate = containerHeight / containerWidth;

        //console.log("contentRate = " + contentRate);
        //console.log("containerRate = " + containerRate);

        if(contentRate > containerRate)
        {
            //console.log("A");
            targetHeight = containerHeight;
            targetWidth = targetHeight * contentWidth / contentHeight;

            height3D = rawContentHeight + bleed * rawContentHeight / targetHeight;
        }
        else
        {
            //console.log("B");

            targetWidth = containerWidth;
            targetHeight = targetWidth * contentHeight / contentWidth;

            height3D = containerHeight * ((rawContentWidth + bleed * rawContentWidth / targetWidth) / containerWidth);
        }

        //console.log("target width = " + targetWidth);
        //console.log("target height = " + targetHeight);


        return {
            screenWidth: targetWidth,
            screenHeight: targetHeight,
            distance: height3D / 2 / Math.tan(Math.PI * fov / 360)
        };

    };

    _p.tweenOpacity = function(object3D, opacity, duration)
    {
        if(!duration) duration = 0;

        if(opacity > 0) object3D.visible = true;

        TweenMax.killTweensOf(object3D.material.uniforms.opacity);

        TweenMax.to(object3D.material.uniforms.opacity, duration, {value:opacity, onComplete:function()
        {
            if(opacity == 0) object3D.visible = false;
        }});
        //TweenMax.to()

    };

}());