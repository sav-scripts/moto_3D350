/**
 * Created by sav on 2015/5/2.
 */
(function(){

    var _p = window.CityLabels = {};

    var _cityLabelDic = {};

    _p.init = function(cb)
    {
        /*
        var dom = document.createElement("div");
        dom.className = "city_label_image";
        $("body").append(dom);
        */

        var array = Main.city_data.city_data,
             index = 0;


        loadOne();

        function loadDone()
        {
            cb.apply();
        }

        function loadOne()
        {
            var dataObj = array[index];
            var cityIndex = dataObj.index;

            var obj = _cityLabelDic[cityIndex] = {};

            obj.labelSrc = "images/city_label_" + cityIndex + ".png";
            obj.smallLabelSrc ="images/city_label_small_" + cityIndex + ".png";

            var image = new Image();
            image.onload = function()
            {
                smallImage.src = obj.smallLabelSrc;
                obj.labelWidth = image.width;
            };

            image.onerror = function()
            {
                alert("fail when loaindg city label for: ["+dataObj.name_en+"]");
            };

            var smallImage = new Image();
            smallImage.onload = function()
            {
                obj.smallLabelWidth = smallImage.width;

                index++;
                (index < array.length)? loadOne(): loadDone();
            };

            smallImage.onerror = function()
            {
                alert("fail when loaindg city label small for: ["+dataObj.name_en+"]");
            };

            image.src = obj.labelSrc;
        }
    };

    _p.getCityLabelDom = function(cityIndex)
    {
        var obj = _cityLabelDic[cityIndex];
        if(!obj) console.error("cityIndex: " + cityIndex + " not exist.");

        var dom = obj.labelDom;
        if(!dom)
        {
            dom = obj.labelDom = document.createElement("div");
            dom.className = "city_label_image";
            $(dom).css("width", obj.labelWidth).css("background-image", "url("+obj.labelSrc+")");
        }

        return dom;
    };

    _p.getSmallCityLabelDom = function(cityIndex)
    {
        var obj = _cityLabelDic[cityIndex];
        if(!obj) console.error("cityIndex: " + cityIndex + " not exist.");

        var dom = obj.smallLabelDom;
        if(!dom)
        {
            dom = obj.smallLabelDom = document.createElement("div");
            dom.className = "city_label_small";
            $(dom).css("width", obj.smallLabelWidth).css("background-image", "url("+obj.smallLabelSrc+")").css("margin-left", -obj.smallLabelWidth *.5);
        }

        return dom;
    };

}());