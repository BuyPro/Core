(function(){
    'use strict';
    var pages = {
            state: {
                hash: '/',
                lastHash: '',
                reset: false
            },
            router: new Router(),
            interval: setInterval(function checkHash(){
                pages.state.hash = window.location.hash.split("#")[1] || "/";
                pages.state.hash = pages.state.hash.charAt(0) === "/" ? pages.state.hash : "/" + pages.state.hash;
                if(pages.state.hash !== pages.state.lastHash || pages.state.reset){
                    pages.state.lastHash = pages.state.hash;
                    pages.setHash(pages.state.hash);
                    pages.router.route("GET", pages.state.hash, {url: pages.state.hash, method: "GET"}, {finished: false});
                    pages.state.reset = false;
                }
            }, 250),
        setHash: function(path) {
            window.location.href = "#" + (path.charAt(0) === "/" ? path : "/" + path);
            pages.state.reset = true;
        }
    }
//    window.location.href = "#/";

    if(window.mu){
        window.mu.pages = pages;
    } else {
        window.pages = pages;
    }
}());
