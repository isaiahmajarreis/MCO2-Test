const mysql = require('mysql2/promise');
const dotenv = require(`dotenv`).config();

/*
const node1 = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: 'mco2_appointments',
    //port: 3306
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, 
    idleTimeout: 50000, 
    queueLimit: 0
})

const node2 = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: 'mco2_appointments',
    //port: 3306
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, 
    idleTimeout: 50000, 
    queueLimit: 0
})

const node3 = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: 'mco2_appointments',
    //port: 3306
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, 
    idleTimeout: 50000, 
    queueLimit: 0
})
*/

const node1 = mysql.createPool({
    host: '10.2.0.204',
    user: "server1",
    //port: 80,
    password: "root",
    database: 'appointments',
});

const node2 = mysql.createPool({
    host:  '10.2.0.205',
    //port: 80,
    user: "server2",
    password: "root",
    database: 'appointments',
});

const node3 = mysql.createPool({
    host: '10.2.0.206',
    //port: 80,
    user: "server3",
    password: "root",
    database: 'appointments',
});

const node_utils = {
    pingNode: async function (node) {
        switch (node) {
            case 1: 
                try { 
                    let val = await node1.query('SELECT 1 AS solution'); 
                    console.log(val[0][0].solution);
                    return true;
                }
                catch (error) { 
                    console.log(`ERROR: SServer is unreachable. Failed to connect to Node ${node}`); 
                    console.log(error);
                }
                break;

            case 2: 
                try {
                    let val = await node2.query('SELECT 2 AS solution');
                    console.log(val[0][0].solution);
                    return true;
                }
                catch (error) { 
                    console.log(`ERROR: SServer is unreachable. Failed to connect to Node ${node}`); 
                    console.log(error);
                }
                break;

            case 3: 
                try {
                    let val = await node3.query('SELECT 3 AS solution');
                    console.log(val[0][0].solution);
                    return true;
                }
                catch (error) { 
                    console.log(`ERROR: SServer is unreachable. Failed to connect to Node ${node}`); 
                    console.log(error);
                }
                break;
        }
        /*
        try {
            const [rows, fields] = await nodes[n - 1].query(`SELECT 1`);
            return true;
        }
        catch (err) {
            console.log(`ERROR: Server is unreachable. Failed to connect to Node ${node}`);
            return false;
        }
        */
    },

    getConnection: async function(n) {
        switch (n) {
            case 1: return await node1.getConnection();
            case 2: return await node2.getConnection();
            case 3: return await node3.getConnection();
        }
    }
}

module.exports = {
    node1: node1,
    node2: node2,
    node3: node3,
    //node2: node2,
    //node3: node3,
    node_utils
}