module.exports = function(handle) {
    var query,
        q = require("q");

    query = handle.query()
            .read()
            .table("products")
            .value("id")
            .value("name")
            .value("description")
            .value("price")
            .value("quantity")
            .where("id", "eq");

    handle.prepare("selectById", query);

    query = handle.query()
            .read()
            .table("products")
            .value("id")
            .value("name")
            .value("description")
            .value("price")
            .value("quantity");

    handle.prepare("selectAll", query);

    query = handle.query()
            .read()
            .table("products")
            .value("quantity")
            .where("id", "eq");

    handle.prepare("quantityOfId", query);

    query = handle.query()
            .create()
            .value("name")
            .value("description")
            .value("price")
            .value("quantity")
            .table("products");

    handle.prepare("createProduct", query);

    query = handle.query()
            .create()
            .value("prod_id")
            .value("path")
            .table("images");

    handle.prepare("createImage", query);

    query = handle.query()
            .read()
            .table("images")
            .value("id")
            .value("path")
            .where("prod_id", "eq");

    handle.prepare("selectImageByProd", query);

    query = handle.query()
            .remove()
            .table("products")
            .where("id", "eq");

    handle.prepare("deleteById", query);

    query = handle.query()
            .native(function(db, data) {
        var defer = q.defer();
        db.query("SELECT products.id as id, products.name as name, products.quantity as quantity, products.price as price FROM categories, products, product_category WHERE catagories.id = products.category.cat_id AND products_category.prod_id = " + data + ";")
    });

}
