//Dependencies
const express = require("express");
const path = require("path");
const dotenv = require(`dotenv`);
const hbs = require("hbs");
const app = express();
const bodyParser = require(`body-parser`);

const { node1, node2, node3, node_utils } = require('./model/nodes.js'); //path to nodes file
const synchronizer = require('./model/synchronizer.js'); //path to synchronizer file
const replicator = require('./model/replicator.js'); //path to replicator file
const router = require('./router/router.js'); //path to router file

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }));

//path to the templates folder
const templatePath = path.join(__dirname,'/templates')

//ifEqual on edit.hbs page
hbs.registerHelper("ifEqual", function(a, b, options) {
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
});

//Formats the queuedate in edit.hbs
hbs.registerHelper("formatDate", function(queuedate) {
    if (queuedate instanceof Date) {
        const year = queuedate.getFullYear();
        const month = String(queuedate.getMonth() + 1).padStart(2, '0');
        const day = String(queuedate.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } else {
        return queuedate;
    }
});

//configure the .env variables
dotenv.config();
var hostname = process.env.HOSTNAME;
var port = process.env.PORT;
var nodenum = process.env.NODENUM;

//local machine credentials
//nodenum = 1;
//hostname = 'localhost';
//port = 5000;

app.set("view engine", "hbs")
app.set("views", templatePath)

app.use('/', router);

app.listen(port,hostname, function () {
    console.log(`Server ` + nodenum + `: http://`+ hostname + `:` + port);
    replicator.replicate();
})

/*
    switch (nodenum) {
        case `1`:
            replicator(synchronizer.centralsync); //For all the data
            break;
        case `2`:
            replicator(synchronizer.fragmentsync, node2, 2); //For Luzon only data
            break;
        case `3`:
            replicator(synchronizer.fragmentsync, node3, 3); //For Visayas Mindanao Only data
            break;
    }

node1.getConnection()
    .then(connection => {
        // Release the acquired connection back to the pool\
        console.log('Connected to database.');
        connection.release();

        // Start the server
        app.listen(port, hostname, () => {
            console.log(`Server: http://${hostname}:${port}`);
        });
    })
    .catch(error => {
        console.error('Error:', error.message);
        process.exit(1); // Exit the process if unable to connect to the database
    });
*/
module.exports = app;