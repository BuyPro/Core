var utils = require("bp-utilities"),
    errors = require("./local_modules/HaltingCodes.js"),
    q = require("q"),
    config,
    confdb,
    server,
    middleware,
    Router,
    api,
    http,
    proceedIfAdmin,
    sendErrorAndResolve;

try {
    config = require("./config.js");
    confdb = config.database[config.database.use];
} catch (e) {
    if(e.message.indexOf("Cannot find module") > -1) {
        console.error(
            utils.ansi.bold(
                utils.ansi.red("config.js not found.\nYou need to make a copy of config.sample.js before starting BuyPro")
            )
        );
        // Lack of config is a fatal error, exit process.
        process.exit(errors.NoConfigError);
    } else {
        throw e;
    }
}

middleware = require("bp-middleware");
server = require("bp-http-server")(config.server);
Router = require("bp-router-core");
api = new Router();
http = require("http");

proceedIfGroup = function(groupName) {
    var checkCredentials = function(group, req, res, next) {
        // This is where the auth check would go if this was
        // Not an assesed piece of software;
        return next();
    }
    return checkCredentials.bind(checkCredentials, groupName);
}
sendErrorAndResolve = function(def, res, err) {
    res.error(500, {code: 500, message: "Internal Server Error. See Response.Details for more Information", details: err.message});
    def.reject(err);
}

confdb.module = require(confdb.module);
dbhandle = require("crossdb")(confdb.adapter, confdb, require(confdb.initFile));
require("./local_modules/PrepareQueries")(dbhandle);

if (config.client.serveStatic) {
    server.use(middleware.static(__dirname + "/public"));
}
server.use(middleware.bodyparser);
server.use(middleware.render(__dirname + "/views"));

server.use(dbhandle.hook);

api.method("PATCH");
api.method("DELETE");

api.get("/wsinfo", function(req, res) {
    res.json({host: config.server.websocket.clientHost, port: config.server.websocket.clientPort});
});

api.get("/", function(req, res, next) {
    if(config.client.renderIndex) {
        return res.sendFile(req, __dirname + "/public/index.html");
    }
});

api.get("/products", function(req, res){
    var def = q.defer();
    req.db.exec("selectAll").then(function(d) {
        res.json({result: d});
        def.resolve(true);
    }, sendErrorAndResolve.bind(null, def, res));
    return def.promise;
});

api.get("/products/:id", function(req, res){
    var def = q.defer();
    req.db.exec("selectById", {conditions: [req.params.id]}).then(function(d) {
        if(d.length === 0) {
            res.error(404, {code: 404, message: "No product with ID " + req.params.id});
        } else {
            res.json({result: d});
        }
        def.resolve(true);
    }, sendErrorAndResolve.bind(null, def, res));
    return def.promise;
});

api.get("/products/:id/images", function(req, res){
    var def = q.defer();
    req.db.exec("selectImageByProd", {conditions: [req.params.id]}).then(function(d) {
        res.json({result: d});
        def.resolve(true);
    }, sendErrorAndResolve.bind(null, def, res));
    return def.promise;
});

api.post("/products/:id/images", function(req, res){
    var def = q.defer(),
        param = [
            req.params.id,
            req.body.path
        ];
    console.log(req.body);
    console.log(param);
    req.db.exec("createImage", param).then(function(d) {
        res.json({id: d.insertId});
        def.resolve(true);
    }, function(e) {
        if(e.message.indexOf("ER_NO_REFERENCED_ROW") > -1) {
            res.error(404, {code: 404, message: "No product with ID " + req.params.id});
        } else {
            sendErrorAndResolve(def, res, e)
        };
    });
    return def.promise;
});

// Check authentication for rest of /products routes
api.all("/products", proceedIfGroup("admin"));
api.post("/products", function(req, res){
    var def = q.defer(),
        param = [
            req.body.name,
            req.body.description,
            req.body.price,
            req.body.quantity
        ];
    console.log(req.body);
    console.log(param);
    req.db.exec("createProduct", param).then(function(d) {
        res.json({id: d.insertId});
        def.resolve(true);
    }, sendErrorAndResolve.bind(null, def, res));

    return def.promise;
});

// Check authentication for rest of /products/:id routes
api.all("/products/:id", proceedIfGroup("admin"));
api.patch("/products/:id", function(req, res){
    //Update Product
    res.send(200, "PATCH PRODUCT" + req.params.id);
});
api.delete("/products/:id", function(req, res){
    var def = q.defer();
    req.db.exec("deleteById", {conditions: [req.params.id]}).then(function(d) {
        if(d.affectedRows > 0) {
            res.json({success: true, details: null});
        } else {
            res.json({success: false, details: "No ID " + req.params.id});
        }
        def.resolve(true);
    }, sendErrorAndResolve.bind(null, def, res));
    return def.promise;
});

server.use(middleware.router(api));

server.ws.do("echo:json", function(conn, message) {
    console.log("ECHO SERVER", message);
    this.send("echo", message);
});

setInterval(function(){
    server.ws.broadcast({time: Date.now()});
}, 1000);

server.listen(http);
