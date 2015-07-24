var q = require("q");
module.exports = function(db, options) {
    var createDeferAndBind = function(func, params, that) {
        var defer = q.defer(),
            cb = function(e, d){
                if(e) {
                    defer.reject(e);
                } else {
                    defer.resolve(d);
                }
            };
        params.push(cb);
        if(that){
            func.apply(that, params);
        } else {
            func.apply(func, params);
        }
        return defer.promise;
    }
     return createDeferAndBind(db.query, ["CREATE SCHEMA IF NOT EXISTS `"+ options.dbname + "` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;"], db).then(function(d){
        return createDeferAndBind(db.query, ["USE " + options.dbname + ";"], db)
    }).then(function(d){
        return createDeferAndBind(db.query, ["CREATE TABLE IF NOT EXISTS `products` (" +
                                             "`id` INT NOT NULL AUTO_INCREMENT,"  +
                                             "`name` VARCHAR(100) DEFAULT '', " +
                                             "`description` TEXT NULL, " +
                                             "`price` DECIMAL(10,2) DEFAULT 0.00, " +
                                             "`quantity` INT DEFAULT 0, " +
                                             "PRIMARY KEY (`id`)) " +
                                             "ENGINE = InnoDB " +
                                             "DEFAULT CHARACTER SET = utf8;"], db)
    }).then(function(d){
        return createDeferAndBind(db.query, ["CREATE TABLE IF NOT EXISTS `images` (" +
                                             "`id` INT NOT NULL AUTO_INCREMENT, " +
                                             "`prod_id` INT NOT NULL, " +
                                             "`path` TEXT NOT NULL, " +
                                             "PRIMARY KEY (`id`), " +
                                             "INDEX `fk_prodlink_idx` (`prod_id` ASC), " +
                                             "CONSTRAINT `fk_prodlink` " +
                                                "FOREIGN KEY (`prod_id`) " +
                                                "REFERENCES `products` (`id`) " +
                                                "ON DELETE CASCADE " +
                                                "ON UPDATE CASCADE) " +
                                             "ENGINE = InnoDB " +
                                             "DEFAULT CHARACTER SET = utf8;"], db)
    }).done();
}
