mu.pages.router.get(/.*/, function(req, res) {
    updateBasket();
})
mu.pages.router.get("/products/:id", function(req, res){
   mu("#content")[0].innerHTML = "<i class='fa fa-spinner fa-spin fa-5x' id='loading-icon'></i>";
   mu.ajax({
       url: "/products/" + req.params.id,
       responseType: 'json',
       callbacks: {
           load: function(data, e) {
               console.log(data);
               data.result[0].price = data.result[0].price.toFixed(2);
               mu("#content")[0].innerHTML = mu.render("single-product", data.result[0], {});
           }
       }
   });
});

mu.pages.router.get("/", function(req, res){
   mu("#content")[0].innerHTML = "<i class='fa fa-spinner fa-spin fa-5x' id='loading-icon'></i>";
   mu.ajax({
       url: "/products",
       responseType: 'json',
       callbacks: {
           load: function(data, e) {
               mu("#content")[0].innerHTML = "";
               if(data){
                   for(var i = 0; i < data.result.length; i++){
                       data.result[i].price = data.result[i].price.toFixed(2);
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
    mu("#content")[0].innerHTML = "<i class='fa fa-spinner fa-spin fa-5x' id='loading-icon'></i>";
    var results = [],
        prom = Q(true),
        idList = JSON.parse(localStorage.getItem("basket") || '{"ids": []}').ids;
        loopF = function(id) {
            console.log("LOOP");
            var def = Q.defer();
            mu.ajax({
                url: '/products/' + id,
                method: 'GET',
                callbacks: {
                    load: function(d){
                        console.log("SUCCESS");
                        d = JSON.parse(d);
                        results.push(d.result[0]);
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
            return def.promise;
        };
    console.log(idList);
    for(var i = idList.length-1; i >= 0; i-=1){
        console.log(i);
        prom = prom.then(loopF.bind(loopF, idList.shift()));
    }

    prom.then(function(){
        console.log("THEN");
        mu("#content")[0].innerHTML = "<div class='row'><div class='col-sm-2 col-sm-offset-2'><button class='tgui-button pull-right basket-clear' data-tgui='success'>Clear Basket</button></div></div>";
       for(var i = 0; i < results.length; i++){
           mu("#content")[0].innerHTML += mu.render("basket-product", results[i], {});
       }
    })
})
