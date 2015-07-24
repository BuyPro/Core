mu.ready(function() {
   var getProducts = function() {
     mu.ajax({
         url: "/products",
         method: "GET",
         callbacks: {
             load: function(d) {
                 var res = d.result,
                     cont = mu("#content")[0];
                 cont.innerHTML = "";
                 res.reduce(function(p, cur) {
                     cont.innerHTML += productFromJson(cur);
                 }, null);
             }
         }
     });
   },
       productFromJson = function(obj) {
           var tmpl = "<div class='product
           return prod;
       }

   getProducts();
});
