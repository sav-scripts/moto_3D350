/**
 * Created by sav on 2015/5/1.
 */
(function(){


    var _p = window.VideoPlayer = {};

    /*
    var _videoList =
    {
        "0": "_ZQTAYS82gY",
        "1": "_ZQTAYS82gY",
        "2": "_ZQTAYS82gY",
        "3": "_ZQTAYS82gY",
        "4": "_ZQTAYS82gY",
        "5": "_ZQTAYS82gY",
        "6": "_ZQTAYS82gY"
    };
    */

    var _videoId = "1PVMGXILVlk";
    //var _videoId = "mXxt8hJbelo";

    var _cb_after_close;

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

    _p.playVideo = function(index, cb_after_close)
    {
        _cb_after_close = cb_after_close;

        var dom = document.createElement("div");
        dom.id = "video_player";

        $("body").append(dom);

        Main.onWindowResize();

        var width = $(dom).width();
        var height = $(dom).height();

        //var videoId = _videoList[index];

        TweenMax.set("#video_player", {alpha:0});

        _player = new YT.Player('video_player', {
            height: height,
            width: width,
            videoId: _videoId,
            playerVars: { controls: 1, showinfo: 0, start:0, autoplay:1, autoHide:1 },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
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


         //var done = false;
         function onPlayerStateChange(event)
         {
             /*
             if (event.data == YT.PlayerState.PLAYING && !done)
             {
                 //setTimeout(stopVideo, 6000);
                 //done = true;
             }
             */
             if(event.data == YT.PlayerState.ENDED)
             {
                 closeVideo();
             }
         }

        /*

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
            SceneAnime.instance.backToMap(_cb_after_close);
            _cb_after_close = null;
        }});
    }

}());