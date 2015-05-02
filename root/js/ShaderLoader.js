/**
 * Created by sav on 2015/4/15.
 */
(function (){

    "use strict";

    var _resources = {};

    var _p = window.ShaderLoader = {};

    _p.preventCache = true;
    _p.defaultPath = "shaders/";
    _p.defaultSubFileName = ".html";


    _p.load = function(list, cb)
    {
        //var unloaded = list.slice(0);

        var index = 0;

        execute();

        function execute()
        {
            if(index < list.length)
            {
                var item = list[index];
                index++;

                var obj;

                if(typeof (item) == "string")
                {
                    obj = {id:item, name:item};
                }
                else obj = item;

                _p.loadOne(obj.id, obj.name, execute);
            }
            else
            {
                if(cb != null) cb.apply();
            }
        }
    };

    _p.loadOne = function(id, fileName, cb)
    {
        fileName = _p.defaultPath + fileName + _p.defaultSubFileName;
        if(_p.preventCache) fileName += "?v=" + new Date().getTime();

        var dom = document.createElement("div");
        $(dom).load(fileName, function()
        {
            _resources[id] = dom;
            if(cb != null)
            {
                cb.apply();
            }
        });
    };

    _p.getShader = function(id, shaderName)
    {
        var dom = _resources[id];
        if(!dom)
        {
            console.error("resource id: ["+id+"] not loaded.");
            return;
        }

        return $(dom).find(shaderName).text();
    };

}());
