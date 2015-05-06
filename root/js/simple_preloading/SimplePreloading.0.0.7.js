// JavaScript Document
(function(){
	
"use strict"
	
function SimplePreloading(styleObj)
{
	var _dom = SimplePreloading.prototype = document.createElement('div');

	/* init */
	_dom.progressDom = null;
	_dom.id = "simple_preloading";
    (typeof(styleObj.innerHTML) == "string")? _dom.innerHTML = styleObj.innerHTML: _dom = styleObj.innerHTML;
	_dom.isHiding = true;
	TweenLite.set(_dom, {alpha:0});
	
	if(styleObj.progressQuery) _dom.progressDom = _dom.querySelectorAll(styleObj.progressQuery)[0];
	
	_dom.popInCenter = function(fadeIn)
	{	
		if(_dom.isHiding == false) return;
		_dom.isHiding = false;
		
		var container = styleObj.container;
		if(container == null) container = document.body;
		if(_dom.parentNode != container) container.appendChild(_dom);
		
		if(styleObj.cbBeforeShow != null) styleObj.cbBeforeShow.apply(null, [_dom]);
		
		
		if(styleObj.manualShow) return;
		
		TweenLite.killTweensOf(_dom);
		TweenLite.to(_dom, styleObj.showDuration, {delay:styleObj.showDelay, alpha:1, onComplete:function()
		{			
			if(styleObj.cbAfterShow != null) styleObj.cbAfterShow.apply(null, [_dom]);
		}});
	}
	
	_dom.setProgress = function(progressString)
	{
		if(!_dom.progressDom) return;
		_dom.progressDom.innerHTML = progressString;
	};
	
	_dom.updateProgress = function(percent, startWeight, weight)
	{
		if(!_dom.progressDom) return;
		if(weight == null) weight = 100;
		if(startWeight == null) startWeight = 0;
		_dom.progressDom.innerHTML = startWeight + parseInt(percent/100*weight) + styleObj.progressUnit;
	};
	
	_dom.hide = function()
	{
		if(_dom.isHiding == true) return;
		_dom.isHiding = true;
		
		//TweenLite.killTweensOf(_dom);
		if(styleObj.cbBeforeHide != null) styleObj.cbBeforeHide.apply(null, [_dom]);
		
		if(styleObj.manualHide) return;
		TweenLite.to(_dom, styleObj.hideDuration, {delay:styleObj.hideDelay ,alpha:0, onComplete:function()
		{
			if(styleObj.cbAfterHide != null) styleObj.cbAfterHide.apply(null, [_dom]);
			if(_dom.parentNode)_dom.parentNode.removeChild(_dom);
		}});
	};
	
	return _dom;
}

var _isInit = false;
var _instanceList = [];

var _styleDic = 
[
	{
		innerHTML:
			"<div class='background'></div>"+
			"<div class='sprite'></div>"+
			"<div class='icon'></div>"+
			"<div class='progress'></div>",
		showDuration:.3,
		showDelay:0,
		hideDuration: .3,
		hideDelay:0,
		progressQuery:".progress",
		progressUnit:" %",
		cbBeforeHide:null,
		cbAfterHide:null,
		cbBeforeShow:null,
		cbAfterShow:null,
		manualShow:false,
		manualHide:false,
		container:null
	}
]

function init(stylesBefore, stylesAfter)
{
    if(_isInit == true) return;
	_isInit = true;
	
	if(stylesBefore != null) _styleDic = stylesBefore.concat(_styleDic);
	if(stylesAfter != null) _styleDic = _styleDic.concat(stylesAfter);


	for(var i=0;i<_styleDic.length;i++)
	{
        if(!_instanceList[i]) _instanceList[i] = new SimplePreloading(_styleDic[i]);
	}

}

SimplePreloading.init = init;

SimplePreloading.defaultStyleIndex = 0;

SimplePreloading.show = function(styleIndex)
{
	//if(!_isInit) init();

	if(!_styleDic[styleIndex]) styleIndex = SimplePreloading.defaultStyleIndex;

    if(!_instanceList[styleIndex]) _instanceList[styleIndex] = new SimplePreloading(_styleDic[styleIndex]);

	_instanceList[styleIndex].popInCenter(styleIndex);
}

SimplePreloading.updateProgress = function(percent, startWeight, weight, styleIndex)
{
	if(!_styleDic[styleIndex]) styleIndex = SimplePreloading.defaultStyleIndex;
	_instanceList[styleIndex].updateProgress(percent, startWeight, weight);
};

SimplePreloading.setProgress = function(progresString, styleIndex)
{
	if(!_styleDic[styleIndex]) styleIndex = SimplePreloading.defaultStyleIndex;
	_instanceList[styleIndex].setProgress(progresString);
};

SimplePreloading.hide = function(styleIndex)
{
	if(!_styleDic[styleIndex]) styleIndex = SimplePreloading.defaultStyleIndex;
	_instanceList[styleIndex].hide();
}

SimplePreloading.getInstance = function(index)
{
	return _instanceList[index];
};

window.SimplePreloading = SimplePreloading;
}());
