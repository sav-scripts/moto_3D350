/**
 * Created by sav on 2015/5/1.
 */
(function(){


    var _p = window.VideoPlayer = {};

    var _videoList =
    {
        "0": "JKZ27ZPMrRo",
        "1": "JKZ27ZPMrRo",
        "2": "qtQsKa8u9cI",
        "3": "JKZ27ZPMrRo",
        "4": "JKZ27ZPMrRo",
        "5": "JKZ27ZPMrRo",
        "6": "JKZ27ZPMrRo"
    };

    var _coverDom = document.createElement("div");
    _coverDom.className = "cover";
    $(_coverDom).bind("click", closeVideo);

    var _player;

    _p.init = function(cb)
    {
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = function() {
            if(cb) cb.apply();
        };

    };

    _p.playVideo = function(index)
    {
        var dom = document.createElement("div");
        dom.id = "video_player";

        $("body").append(dom);

        Main.onWindowResize();

        var width = $(dom).width();
        var height = $(dom).height();

        var videoId = _videoList[index];

        TweenMax.set("#video_player", {alpha:0});

        _player = new YT.Player('video_player', {
            height: height,
            width: width,
            videoId: videoId,
            playerVars: { 'controls': 0, showinfo: 0, start:0 },
            events: {
                'onReady': onPlayerReady
                //'onStateChange': onPlayerStateChange
            }
        });




         function onPlayerReady(event)
         {
             //player.seekTo(5);

             DetailMap.instance.hide();

            TweenMax.to("#video_player",.7, {alpha:1, onComplete:function()
            {
                event.target.playVideo();
                $("body").append(_coverDom);
            }});
         }

        /*
         var done = false;
         function onPlayerStateChange(event)
         {
             if (event.data == YT.PlayerState.PLAYING && !done)
             {
                 //setTimeout(stopVideo, 6000);
                 //done = true;
             }
         }


         function stopVideo() {
            player.stopVideo();
         }
         */
    }

    function closeVideo(event)
    {
        $(_coverDom).detach();


        TweenMax.to("#video_player",.5, {alpha:0, onComplete:function()
        {
            _player.stopVideo();
            _player.destroy();
            $("#video_player").detach();
            SceneAnime.instance.backToMap();
        }});
    }

}());