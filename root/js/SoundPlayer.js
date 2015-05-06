// JavaScript Document
(function(){
	
var _p = window.SoundPlayer =
{
	initSound:initSound
};

    window._FIX_ = false;
	
function initSound()
{
	var _queueBGM = false;
	var _bgm;
	var audioPath = "misc/";
	var manifest = [
		{id:"bgm", src:"sound.m4a", volume:.4}
	];

	if(_FIX_)
	{
		createjs.FlashPlugin.swfPath = "misc/";
		createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	}
	
	if (!createjs.Sound.initializeDefaultPlugins()) 
	{
		console.log("can't init soundjs");
		return;
	}
	
	createjs.Sound.alternateExtensions = ["mp3"];
	createjs.Sound.addEventListener("fileload", handleLoad);
	createjs.Sound.registerManifest(manifest, audioPath);
 
	function handleLoad(event) {
		createjs.Sound.removeEventListener("fileload", handleLoad);
		
		_bgm = createjs.Sound.play("bgm", "none", 0, 0, -1);
		_FIX_? _bgm.stop(): _bgm.pause();
	
		if(_queueBGM)
		{
			_queueBGM = false;
			playBGM();
		}
	}
	
	var _bgmOn = true;
	
	_p.getBGMStatus = function(){ return _bgmOn; };

    _p.playBGM = playBGM;
    _p.stopBGM = stopBGM;

    _p.switchBGM = function(isOn)
	{
		if(isOn != undefined && isOn == _bgmOn) return;
		
		_bgmOn = !_bgmOn;
		
		if(_bgmOn)
		{
			//$(Menu.Doms.btnMusic).css("background-image", "url(images/music_on.png)");
			playBGM();
		}
		else
		{
			//$(Menu.Doms.btnMusic).css("background-image", "url(images/music_off.png)");
			stopBGM();
		}
	};
	
	
	function playBGM()
	{
		if(_bgm)
		{
			if(_FIX_)
			{
				if(_bgm.playState == 'playFinished') _bgm.play({loop:-1});
			}
			else _bgm.resume();
			
			_bgm.volume = .0;
			TweenLite.killTweensOf(_bgm);
			TweenLite.to(_bgm, 1, {volume:.5, onUpdate:function()
			{
				if(_FIX_) _bgm.setVolume(_bgm.volume);
			}});
			
			
		}
		else
		{
			_queueBGM = true;
		}
	}
	
	function stopBGM()
	{
		_queueBGM = false;
		if(_bgm)
		{
			TweenLite.killTweensOf(_bgm);
			TweenLite.to(_bgm, 1, {volume:.0, onUpdate:function()
			{
				if(_FIX_) _bgm.setVolume(_bgm.volume);
			}, onComplete:function()
			{
				_FIX_? _bgm.stop(): _bgm.pause();
			}});
		}
	}
}
	
}());