const {node1, node2, node3, node_utils} = require('./nodes.js'); 
const transaction_utils = require('./transaction.js');

const db_queries = {
    //Get all the index from the Database or Filter the data from database.
    allQuery: async function (indexQuery, island, nodenum) {
        const sqlQuery = 'SELECT * FROM appointments ' + indexQuery;
        
        //If Node is 1 and Node 1 is available.
        if(nodenum == 1 && await node_utils.pingNode(1))
        {
            console.log(`MESSAGE: Selecting index from NodeNum ${nodenum}`);
            const [rows, fields] = await node1.query(sqlQuery);
            return rows;
        }
        else if (nodenum == 2 && await node_utils.pingNode(2))
        {
            console.log(`MESSAGE: Selecting index from NodeNum ${nodenum}`);
            const [rows, fields] = await node2.query(sqlQuery);
            return rows;
        }
        else if (nodenum == 3 && await node_utils.pingNode(3))
        {
            console.log(`MESSAGE: Selecting index from NodeNum ${nodenum}`);
            const [rows, fields] = await node3.query(sqlQuery);
            return rows;
        }
        else
        {
            //If in central node
            if(nodenum == 1)
            {
                console.log("MESSAGE: Selecting index from Node 1 failed. Node 1 is unavailable.");
            } 
            //If Luzon values, then go to node2
            if((island == "Luzon") 
                && await node_utils.pingNode(2)) //if region is in Luzon, then it should transact to Node 2, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Selecting index from Node 2. Island = ${island}`);
                const [rows, fields] = await node2.query(sqlQuery);
                return rows;
            }
            //If visayas and mindanao, then go to node3
            else if((island == "Visayas" || island == "Mindanao")
                    && await node_utils.pingNode(3)) //if region is not in Luzon, then it should transact to Node 3, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Selecting index from Node 3. Island = ${island}`);
                const [rows, fields] = await node3.query(sqlQuery);
                return rows;
            }
            //Transact to central node, if value is in Luzon,Visayas, Mindanao but other nodes not working, viceversa
            else if(await node_utils.pingNode(1))
            {
                console.log("MESSAGE: Selecting index from Node 1. Node 2 and 3 is unavailable.");
                const [rows, fields] = await node1.query(sqlQuery);
                return rows;
            }
            else
            {
                console.log("MESSAGE: Nodes are unavailable.");
            }
        }//ENDELSE 

        //const [rows, fields] = await node1.query('SELECT * FROM appointments ' + indexQuery);
        
    },

    //Insert the values to the database.
    insertQuery: async function (sqlQuery, regionname, nodenum) {
        console.log("MESSAGE: Inserting values to database");

        //If Node is 1 and Node 1 is available.
        if(nodenum == 1 && await node_utils.pingNode(1))
        {
            console.log(`MESSAGE: Inserting value to Node 1 because Node is at ${nodenum}`);
            await transaction_utils.queryTransaction(nodenum, sqlQuery);
        }
        else
        {
            //If in central node
            if(nodenum == 1)
            {
                console.log("MESSAGE: Insert to Node 1 failed. Node 1 is unavailable.");
                //await transaction_utils.queryTransaction(nodenum, sqlQuery);
            }
            
            //If Luzon values, then go to node2
            if((regionname == "National Capital Region (NCR)" || regionname == "National Capital Region (NCR)" ||
                regionname == "Cagayan Valley (II)" || regionname == "CALABARZON (IV-A)" || regionname == "Central Luzon (III)" || 
                regionname == "MIMAROPA (IV-B)" || regionname == "Bicol Region (V)" || regionname == "Cordillera Administrative Region (CAR)") 
                && await node_utils.pingNode(2)) //if region is in Luzon, then it should transact to Node 2, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Inserting to Node 2. Regionname = ${regionname}`);
                await transaction_utils.queryTransaction(2, sqlQuery);
            }
            //If visayas and mindanao, then go to node3
            else if((regionname == "Caraga (XIII)" || regionname == "Central Visayas (VII)" || 
                    regionname == "Western Visayas (VI)" || regionname == "Davao Region (XI)" || 
                    regionname == "SOCCSKSARGEN (Cotabato Region) (XII)" || regionname == "Northern Mindanao (X)" || 
                    regionname == "Zamboanga Peninsula (IX)" || regionname == "Eastern Visayas (VIII)" || 
                    regionname == "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)")
                    && await node_utils.pingNode(3)) //if region is not in Luzon, then it should transact to Node 3, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Inserting to Node 3. Regionname = ${regionname}`);
                await transaction_utils.queryTransaction(3, sqlQuery);
            }
            //Transact to central node, if value is in Luzon but in node3, viceversa
            else if(await node_utils.pingNode(1))
            {
                console.log("MESSAGE: Inserting to Node 1. Node 2 and 3 is unavailable.");
                await transaction_utils.queryTransaction(1, sqlQuery);
            }
            else
            {
                console.log("MESSAGE: Nodes are unavailable.");
            }
        }//ENDELSE

        //TEST: Test to insert to query.
        //var result = await node1.query(sqlQuery);
        //return result;
    },

    //Delete a row from the database.
    deleteQuery: async function (sqlQuery, regionname, nodenum) {
        console.log("MESSAGE: Deleting row to database");

        //If Node is 1 and Node 1 is available.
        if(nodenum == 1 && await node_utils.pingNode(1))
        {
            console.log(`MESSAGE: Deleting row from Node 1 at ${nodenum}`);
            await transaction_utils.queryTransaction(nodenum, sqlQuery);
        }
        else
        {
            //If in central node
            if(nodenum == 1)
            {
                console.log("MESSAGE: Deleting from Node 1 failed. Node 1 is unavailable.");
            } 

            //If Luzon values, then go to node2
            if((regionname == "National Capital Region (NCR)" || regionname == "National Capital Region (NCR)" ||
                regionname == "Cagayan Valley (II)" || regionname == "CALABARZON (IV-A)" || regionname == "Central Luzon (III)" || 
                regionname == "MIMAROPA (IV-B)" || regionname == "Bicol Region (V)" || regionname == "Cordillera Administrative Region (CAR)") 
                && await node_utils.pingNode(2)) //if region is in Luzon, then it should transact to Node 2, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Deleting from Node 2. Regionname = ${regionname}`);
                await transaction_utils.queryTransaction(2, sqlQuery);
            }
            //If visayas and mindanao, then go to node3
            else if((regionname == "Caraga (XIII)" || regionname == "Central Visayas (VII)" || 
                    regionname == "Western Visayas (VI)" || regionname == "Davao Region (XI)" || 
                    regionname == "SOCCSKSARGEN (Cotabato Region) (XII)" || regionname == "Northern Mindanao (X)" || 
                    regionname == "Zamboanga Peninsula (IX)" || regionname == "Eastern Visayas (VIII)" || 
                    regionname == "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)")
                    && await node_utils.pingNode(3)) //if region is not in Luzon, then it should transact to Node 3, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Deleting from Node 3. Regionname = ${regionname}`);
                await transaction_utils.queryTransaction(3, sqlQuery);
            }
            //Transact to central node, if value is in Luzon but in node3, viceversa
            else if(await node_utils.pingNode(1))
            {
                console.log("MESSAGE: Deleting from Node 1. Node 2 and 3 is unavailable.");
                await transaction_utils.queryTransaction(1, sqlQuery);
            }
            else
            {
                console.log("MESSAGE: Nodes are unavailable.");
            }
        }//ENDELSE       

        /*
        //TEST: Test to delete query.
        console.log("MESSAGE: Deleting index " + apptid);
        var result = await node1.query('DELETE FROM appointments WHERE apptid = ?', [apptid]);
        return result;
        */
    },

    //Get a row based on the selected index.
    selectQuery: async function (apptid, regionname, nodenum) {
        console.log("MESSAGE: Selecting index " + apptid);

        const sqlQuery = 'SELECT * FROM appointments WHERE apptid = ' + apptid;

        //If Node is 1 and Node 1 is available.
        if(nodenum == 1 && await node_utils.pingNode(1))
        {
            console.log(`MESSAGE: Selecting index from Node 1 at ${nodenum}`);
            const [rows, fields] = await transaction_utils.queryTransaction(nodenum, sqlQuery);
            
            return rows;
        }
        else
        {
            //If in central node
            if(nodenum == 1)
            {
                console.log("MESSAGE: Selecting index from Node 1 failed. Node 1 is unavailable.");
            } 

            //If Luzon values, then go to node2
            if((regionname == "National Capital Region (NCR)" || regionname == "National Capital Region (NCR)" ||
                regionname == "Cagayan Valley (II)" || regionname == "CALABARZON (IV-A)" || regionname == "Central Luzon (III)" || 
                regionname == "MIMAROPA (IV-B)" || regionname == "Bicol Region (V)" || regionname == "Cordillera Administrative Region (CAR)") 
                && await node_utils.pingNode(2)) //if region is in Luzon, then it should transact to Node 2, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Selecting index from Node 2. Regionname = ${regionname}`);
                const [rows, fields]  = await transaction_utils.queryTransaction(2, sqlQuery);
                return rows;
            }
            //If visayas and mindanao, then go to node3
            else if((regionname == "Caraga (XIII)" || regionname == "Central Visayas (VII)" || 
                    regionname == "Western Visayas (VI)" || regionname == "Davao Region (XI)" || 
                    regionname == "SOCCSKSARGEN (Cotabato Region) (XII)" || regionname == "Northern Mindanao (X)" || 
                    regionname == "Zamboanga Peninsula (IX)" || regionname == "Eastern Visayas (VIII)" || 
                    regionname == "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)")
                    && await node_utils.pingNode(3)) //if region is not in Luzon, then it should transact to Node 3, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Selecting index from Node 3. Regionname = ${regionname}`);
                const [rows, fields]  = await transaction_utils.queryTransaction(3, sqlQuery);
                return rows;
            }
            //Transact to central node, if value is in Luzon but in node3, viceversa
            else if(await node_utils.pingNode(1))
            {
                console.log("MESSAGE: Selecting index from Node 1. Node 2 and 3 is unavailable.");
                const [rows, fields]  = await transaction_utils.queryTransaction(1, sqlQuery);
                return rows;
            }
            else
            {
                console.log("MESSAGE: Nodes are unavailable.");
            }
            
        }//ENDELSE 

        //const [rows, fields] = await node1.query('SELECT * FROM appointments WHERE apptid = ?', [apptid]);
        //return rows;
    },

    //Update the row from the Databasee.
    updateQuery: async function (sqlQuery, regionname, nodenum) {
        console.log("MESSAGE: Updating index region is " + regionname);

        //If Node is 1 and Node 1 is available.
        if(nodenum == 1 && await node_utils.pingNode(1))
        {
            console.log(`MESSAGE: Updating row from Node 1 at ${nodenum}`);
            await transaction_utils.queryTransaction(nodenum, sqlQuery);
        }
        else
        {
            //If in central node
            if(nodenum == 1)
            {
                console.log("MESSAGE: Updating from Node 1 failed. Node 1 is unavailable.");
            } 

            //If Luzon values, then go to node2
            if((regionname == "National Capital Region (NCR)" || regionname == "National Capital Region (NCR)" ||
                regionname == "Cagayan Valley (II)" || regionname == "CALABARZON (IV-A)" || regionname == "Central Luzon (III)" || 
                regionname == "MIMAROPA (IV-B)" || regionname == "Bicol Region (V)" || regionname == "Cordillera Administrative Region (CAR)") 
                && await node_utils.pingNode(2)) //if region is in Luzon, then it should transact to Node 2, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Updating from Node 2. Regionname = ${regionname}`);
                await transaction_utils.queryTransaction(2, sqlQuery);
            }
            //If visayas and mindanao, then go to node3
            else if((regionname == "Caraga (XIII)" || regionname == "Central Visayas (VII)" || 
                    regionname == "Western Visayas (VI)" || regionname == "Davao Region (XI)" || 
                    regionname == "SOCCSKSARGEN (Cotabato Region) (XII)" || regionname == "Northern Mindanao (X)" || 
                    regionname == "Zamboanga Peninsula (IX)" || regionname == "Eastern Visayas (VIII)" || 
                    regionname == "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)")
                    && await node_utils.pingNode(3)) //if region is not in Luzon, then it should transact to Node 3, when Node 1 is unavailable.
            {
                console.log(`MESSAGE: Updating from Node 3. Regionname = ${regionname}`);
                await transaction_utils.queryTransaction(3, sqlQuery);
            }
            //Transact to central node, if value is in Luzon but in node3, viceversa
            else if(await node_utils.pingNode(1))
            {
                console.log("MESSAGE: Updating from Node 1. Node 2 and 3 is unavailable.");
                await transaction_utils.queryTransaction(1, sqlQuery);
            }
            else
            {
                console.log("MESSAGE: Nodes are unavailable.");
            }
        }//ENDELSE   

        /*
        //TEST: Test to update
        console.log("MESSAGE: Updating index " + apptid);
        const [rows, fields] = await node1.query('UPDATE appointments SET pxid = ?, queuedate = ?, hospitalname = ?, city = ?, type = ?, status = ? WHERE apptid = ?;', [pxid, queuedate, hospitalname, city, type, status, apptid]);
        return rows;
        */
    },
}
function describeCase1() {
  describe("Case #1: Concurrent transactions in two or more nodes are reading the same data item", () => {
    test("Repeatable Read", async () => {
      await testFetchAppointment(mainConnection, shardConnection, mainConnection2, "REPEATABLE READ", appointmentId);
    });
}

module.exports = db_queries;
describeCase1();