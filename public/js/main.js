mu("body").on("click", "[data-route]", function(e) {
    e.preventDefault();
    mu.pages.setHash(this.getAttribute("data-route"));
});

mu('body').on("click", ".product .product-delete", function(e){
    e.preventDefault();
    parent = mu(this).parent(".product");
    mu.ajax({
        url: "/products/" + parent[0].id,
        method: "DELETE",
        callbacks: {
            load: function(d) {
                parent[0].parentElement.removeChild(parent[0]);
            }
        }
    });
});


mu('body').on("click", ".product .basket-add", function(e){
    e.preventDefault();
    parent = mu(this).parent(".product");
    idList = JSON.parse(localStorage.getItem("basket") || '{"ids": []}');
    idList.ids.push(parent[0].id);
    var refcount = {};
    idList.ids = idList.ids.filter(function(a) {
        if(!refcount.hasOwnProperty(a)) {
            refcount[a] = 1;
            return true;
        } else {
            return false;
        }
    });
    localStorage.setItem("basket", JSON.stringify(idList));
    updateBasket();
});
mu('body').on("click", ".product .basket-remove", function(e){
    e.preventDefault();
    parent = mu(this).parent(".product")[0];
    idList = JSON.parse(localStorage.getItem("basket") || '{"ids": []}');
    for(var i = idList.ids.length; i >= 0; i -= 1){
        if(idList.ids[i] === parent.id) {
            idList.ids.splice(i, 1);
        }
    }
    localStorage.setItem("basket", JSON.stringify(idList));
    updateBasket();
    mu.pages.setHash("/basket");
});
mu('body').on("click", ".basket-clear", function(e){
    e.preventDefault();
    localStorage.setItem("basket", '{"ids": []}');
    mu.pages.setHash("/");
});


mu('body').on("click", "#save-product", function(e){
    e.preventDefault();
    var data = new FormData(mu("#newproduct")[0]);
    mu.ajax({
        data: data,
        url: '/products',
        method: "POST",
        callbacks: {
            load: function(data){
                console.log(data);
            }
        }
    });
    bodyListener(e);
});

var createPopup = function(content) {
        console.log("Popup");
        mu("#all").class("bluranddisable");
        mu('body')[0].innerHTML += "<div id='popup' class='grid-padded'></div>";
        mu("#popup")[0].innerHTML = content;
        mu("#all").on("click", bodyListener);
    },
    bodyListener = function(e){
        e.preventDefault();
        mu("body")[0].removeChild(mu("#popup")[0]);
        var content = mu("#all")[0];
        content.classList.remove("bluranddisable");
        content.removeEventListener("click", bodyListener);
        window.history.back();
    }
