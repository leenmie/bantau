require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
});

require(
    [
    '../game.min',
    ], 
    function
    (
        lib_impact
    ) 
{
    ig
    .module('game.main')
    .requires(
        'game.play'
    )
    .defines(function(){
        var canvas = document.getElementById('canvas');
        var height = window.innerHeight;
        var width = window.innerWidth;
        if (height > 768) {
            height = 768;
        }
        var rate = width/height;
        if (rate < 1.2) {
            height = width / 1.2;
        }
        if (rate > 1.7) {
            width = height * 1.7;
        }
        canvas.setAttribute('style', 'position: relative; left:'+ (window.innerWidth - width)/2 + 'px;'+'cursor:crosshair;');
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';                
                
    	ig.Sound.channels = 10;
    	//ig.Sound.enabled = false;
        ig.main('#canvas', BanTauGame, 30, 640, 480, 1, ig.SplashLoader); 
        //ig.main('#canvas', PokerGame, 30, 320, 240, 1, ig.SplashLoader);
        ig.music.add('media/music/giai_phong_quan.ogg');
        ig.music.add('media/music/hat_mai_khuc_quan_hanh.ogg');
        ig.music.volume = 1;
        ig.music.play();
        
        //ig.music.muted = false;
    });    
}
);
