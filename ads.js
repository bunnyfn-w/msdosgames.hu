
// DOSGames Vertical Banner Alignment
// Darren Hewer 2022

$(document).ready(function(){

    var vertleft = $('.verticalBanner--left');
    var vertright = $('.verticalBanner--right');
    var headersize = 137;
    var margintop = 16;
    var distancecurrent = 0;
    var widedesktop = 1366;
    
    function scrollverts() {
        var newpos;
        if ($(window).width() < widedesktop) return;
        newpos = headersize - $(window).scrollTop();
        if (newpos < margintop) newpos = margintop;
        if (newpos === margintop && newpos === distancecurrent) return;
        distancecurrent = newpos;
        newpos += 'px';
        vertleft.css('top', newpos);
        vertright.css('top', newpos);
    }
    
    scrollverts();
    window.addEventListener('scroll', scrollverts, false);
    window.addEventListener('resize', scrollverts, false);
    
});
