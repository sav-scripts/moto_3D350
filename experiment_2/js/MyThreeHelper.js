/**
 * Created by sav on 2015/4/26.
 */
(function(){

    var _p = window.MyThreeHelper = {};

    _p.worldToScreen = function(position, renderer, camera)
    {
        var vector = new THREE.Vector3();

        var obj = new THREE.Object3D();
        obj.position.x = position.x;
        obj.position.y = position.y;

        var widthHalf = 0.5*renderer.context.canvas.width;
        var heightHalf = 0.5*renderer.context.canvas.height;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(camera);

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;

        return vector;
    };

}());