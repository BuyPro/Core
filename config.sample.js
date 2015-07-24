module.exports = {
    server: {
        appname: "BuyPro", // The name of the application, for process managers and logs
        host: 'localhost', // Hostname of the server to bind to
        port: 8081, // Port to bind this application
        closeDBonFinish: false,  // Closes DB connection after the request has finished. Almost always a bad idea
        websocket: {
            enabled: true, // Whether or not to enable the Websocket server
            clientHost: "localhost", // The host to send to clients requesting WS information
            clientPort: 8081 // The port to send to clients requesting WS information
        }
    },
    database: {
        use: "mysql", // Set to the name of the config to use
        mysql: {
            module: "mysql", // This will be require'd and passed to the adapter
            initFile: "local_modules/mysql-dbinit", // This file will be used to initialise the Database
            adapter: "mysql", // The CrossDB adapter to use
            connect: { // Connect will be passed to the database module as an options object, refer
                       // To the documentation of your chosen module for more options
                user: "changeme", // Database username to connect with
                password: "changeme", // Database password associated with username
                host: "localhost",  // Database hostname. Will be localhost if the DB server
                                    // is on the same machine as this application
                connectionLimit: 25 // The limit to the number of connections available to the
                                    // mysql connection pool used by CrossDB
            }
        },
        "mysql-highlimit": { // Same as 'mysql' but with an effectively uncapped number of connections -
                             // The server will more than likely not be able to handle 1200 concurrents
            module: "mysql",
            initFile: "local_modules/mysql-dbinit",
            connect: {
                user: "changeme",
                password: "changeme",
                host: "localhost",
                connectionLimit: 1200
            }
        }
    },
    client: {
        renderIndex: true, // Render the index page when the use sends a GET request to '/'
                           // Setting to false will run the application as an API server
        serveStatic: true, // Serve static files like CSS, Javascript and Images
        title: "BuyPro" // The title to be displayed in the browser's nav bar
    }
}
