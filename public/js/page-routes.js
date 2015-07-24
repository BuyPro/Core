mu.pages.router.get("/products/:id", function(req, res){
   mu.ajax({
       url: "/products/" + req.params.id,
       responseType: 'json',
       callbacks: {
           load: function(data, e) {
               console.log(data);
               mu("#content")[0].innerHTML = mu.render("single-product", data.result[0], {});
           }
       }
   });
});

mu.pages.router.get("/", function(req, res){
    console.log("/");
   mu.ajax({
       url: "/products",
       responseType: 'json',
       callbacks: {
           load: function(data, e) {
               mu("#content")[0].innerHTML = "";
               if(data){
                   for(var i = 0; i < data.result.length; i++){
                       mu("#content")[0].innerHTML += mu.render("multi-product", data.result[i], {});
                   }
               } else {

               }
           }
       }
   });
});

mu.pages.router.get("/new/product", function(req, res){
    createPopup(mu.render("product-form", {}, {}));
});

mu.pages.router.get("/basket", function(req, res){
    var results = [],
        idList = JSON.parse(localStorage.getItem("basket") || '{"ids": []}').ids;
        loopF = function(id) {
            var def = E.defer();
            mu.ajax({
                url: '/products/' + id,
                method: 'GET',
                callbacks: {
                    load: function(d){
                        results.push(d.result);
                        def.resolve(true);
                    },
                    error: function(er) {
                        if(!er.code === 404){
                            throw new Error(er.message);
                        }
                        def.resolve(true);
                    }
                }
            });
        },
            prom = E.defer().resolve(true);

    for(var i = idList.length-1; i >= 0; i-=1){
        prom = prom.then(loopF.bind(loopF, idList.shift()));
    }

    prom.then(function(){
        mu("#content")[0].innerHTML = "<div class='col-sm-2 col-sm-offset-2><button class='tgui-button pull-right basket-clear' data-tgui='success'>Clear Basket</button>";
       for(var i = 0; i < results.length; i++){
           mu("#content")[0].innerHTML += mu.render("basket-product", results[i], {});
       }
    })
})
