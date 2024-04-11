const {node1, node2, node3, node_utils} = require('../model/nodes'); //path to nodes file
const synchronizer = require('../model/synchronizer.js'); //path to synchronizer file
const dbquery = require('../model/database');
const dotenv = require(`dotenv`).config();

const controller = {
    //Get the Data from Database
    getIndex: async function (req, res) {
        console.log("MESSAGE: Getting rows from DB");
        var indexQuery = "";
        let island = req.query.island;

        if(island == "Luzon") //Get only the Luzon Appointments
        {
            indexQuery = 
                "WHERE regionname LIKE '%(I)%' " +
                "OR regionname LIKE '%(II)%' " +
                "OR regionname LIKE '%(III)%' " +
                "OR regionname LIKE '%(IV-A)%' " +
                "OR regionname LIKE '%(IV-B)%' " +
                "OR regionname LIKE '%(V)%' " +
                "OR regionname LIKE '%(CAR)%' " +
                "OR regionname LIKE '%(NCR)%';";
        }
        else if (island == "Visayas") //Get only the Visayas Appointments
        {
            indexQuery = "WHERE regionname LIKE '%(VI)%' OR regionname LIKE '%(VII)%' OR regionname LIKE '%(VIII)%';";
        }
        else if (island == "Mindanao") //Get only the Mindanao Appointments
        {
            indexQuery = "WHERE regionname LIKE '%(IX)%' OR regionname LIKE '%(X)%' OR regionname LIKE '%(XI)%' OR regionname LIKE '%(XII)%' OR regionname LIKE '%(XIII)%' OR regionname LIKE '%(BARMM)%';";
        }
        else
        {
            indexQuery = ";";
        }

        const appointments = await dbquery.allQuery(indexQuery, island, process.env.NODENUM);
        res.render('index', {appointments})
    },

    //Add appointment to Database
    postAddAppointment: async function (req, res) {
        try {
            console.log("MESSAGE: Adding appointment to DB.");
            var pxid = req.body.pxid
            var queuedate = req.body.queuedate + " 16:00:00"
            var hospitalname = req.body.hospitalname
            var city  = req.body.city
            var regionname  = req.body.regionname
            var type  = req.body.type
            var status = "Queued"

            sqlQuery = `INSERT INTO appointments (pxid, queuedate, hospitalname, city, regionname, type, status) VALUES ('` + pxid + `','` + queuedate + `','` + 
                        hospitalname  + `','` + city + `', '` + regionname + `', '` + type + `', '`  + status + `')`;

            
            const queryLastID = `SELECT MAX(apptid) AS id FROM appointments`;
            let lastID, lastSelfID, fields1, fields2;

            //Strictly when Node 1 is available
            if(await node_utils.pingNode(1))
            {
                console.log("MESSAGE: ADD Node 1");
                [lastID, fields1] = await node1.query(queryLastID); //get the last ID of node1
                //console.log("queryLastID " + lastID);

                if(process.env.NODENUM == "1")
                {
                    [lastSelfID, fields2] = await node1.query(queryLastID);
                    //console.log("SelfLastID " + lastSelfID);
                }
                else if(process.env.NODENUM == "2")
                {
                    [lastSelfID, fields2] = await node2.query(queryLastID);
                    //console.log("SelfLastID " + lastSelfID);
                }
                else if(process.env.NODENUM == "3")
                {
                    [lastSelfID, fields2] = await node3.query(queryLastID);
                    //console.log("SelfLastID " + lastSelfID);
                }
            }
            //Strictly when transacting with Node 3 and Node 2 is available.
            else if(process.env.NODENUM == "3" && await node_utils.pingNode(2))
            {
                console.log("MESSAGE: ADD Node 3 await Node 2");
                [lastID, fields1] = await node2.query(queryLastID); //get the last ID of node2
                [lastSelfID, fields2] = await node3.query(queryLastID); //get the last ID of the selfnode3
                console.log("SelfLastID " + lastID);
            }
            //Strictly when transacting with Node 2 and Node 3 is available.
            else if(process.env.NODENUM == "2" && await node_utils.pingNode(3))
            {
                console.log("MESSAGE: ADD Node 2 await Node 3");
                [lastID, fields1] = await node3.query(queryLastID); //get the last ID of node3
                [lastSelfID, fields2] = await node2.query(queryLastID); //get the last ID of the selfnode2
                console.log("SelfLastID " + lastID);
            }

            if(lastID[0].id <= lastSelfID[0].id)
            {
                await dbquery.insertQuery(sqlQuery, regionname, process.env.NODENUM);

                await synchronizer.centralsync(); //sync to central  
                await synchronizer.fragmentsync(2); //sync to fragment 2
                await synchronizer.fragmentsync(3); //sync to fragment 3
            }
            else if(lastID[0].id > lastSelfID[0].id){
                lastSelfID = lastID[0].id + 1;

                sqlQuery = `INSERT INTO appointments (apptid, pxid, queuedate, hospitalname, city, regionname, type, status) VALUES ('`+ lastSelfID + `','` + pxid + `','` + queuedate + `','` + 
                            hospitalname  + `','` + city + `', '` + regionname + `', '` + type + `', '`  + status + `')`;

                await dbquery.insertQuery(sqlQuery, regionname, process.env.NODENUM);
                await synchronizer.centralsync(); //sync to central  
                await synchronizer.fragmentsync(2); //sync to fragment 2
                await synchronizer.fragmentsync(3); //sync to fragment 3
            }
        }//END TRY
        catch(error)
        {
            console.log(error);
        }
        /*
        //TEST: Simple Add Appointment to Database code. 
        console.log(pxid, queuedate, hospitalname, city, regionname, type, status);
        try {
            console.log(sqlQuery);
            const result = await dbquery.insertQuery(sqlQuery, regionname, 1)
            if (result) {
                console.log("MESSAGE: Added Appointment!");
            }
            else {
                console.log("MESSAGE: Add Transaction Failed");
            }
        } catch (err) { }
        */

        res.redirect('/');
    },

    //Delete Appointment from Database
    getDeleteAppointment: async function (req, res) {
        console.log("MESSAGE: Deleting row from DB");
        var apptid = req.query.id;

        const sqlQuery = `DELETE FROM appointments WHERE apptid = ` + apptid;

        console.log(apptid);
        try {
            const result = await dbquery.deleteQuery(sqlQuery, req.query.regionname, process.env.NODENUM);
            await synchronizer.centralsync(); //sync to central  
            await synchronizer.fragmentsync(2); //sync to fragment 2
            await synchronizer.fragmentsync(3); //sync to fragment 3
            if (result) {
                console.log("MESSAGE: Appointment Deleted!");
            }
            else {
                console.log("MESSAGE: Delete Transaction Failed");
            }
        } catch (err) { }
        res.redirect('/');
    },

    //Lead to Edit Page
    getEditAppointment: async function (req, res) {
        console.log("MESSAGE: Selecting row from DB");
        console.log(req.query.id + " " + req.query.regionname + " " + process.env.NODENUM);
        const appointments = await dbquery.selectQuery(req.query.id, req.query.regionname, process.env.NODENUM);
        res.render('edit', appointments);
    },

    //Update the Appointment
    postUpdateAppointment: async function (req, res) {
        console.log("MESSAGE: Updating row from DB");
        var apptid = req.body.apptid;
        var pxid = req.body.pxid;
        var queuedate = req.body.queuedate + " 16:00:00";
        var hospitalname = req.body.hospitalname;
        var city  = req.body.city;
        var regionname  = req.body.regionname;
        var type  = req.body.type;
        var status = req.body.status;

        const sqlQuery1 = `UPDATE appointments SET pxid = '` + pxid + `', queuedate = '` + 
                        queuedate + `', hospitalname = '` + hospitalname + `', city = '` + city + 
                        `', type = '` + type + `', status = '` + status  + `' WHERE apptid = ` + apptid;

        try {
            console.log(sqlQuery1 + " || " + regionname);
            const result = await dbquery.updateQuery(sqlQuery1, regionname, process.env.NODENUM);

            await synchronizer.centralsync(); //sync to central  
            await synchronizer.fragmentsync(2); //sync to fragment 2
            await synchronizer.fragmentsync(3); //sync to fragment 3
            if (result) {
                console.log("MESSAGE: Updated Appointment!");
            }
            else {
                console.log("MESSAGE: Update Transaction Failed");
            }
            
        } catch (err) { console.log(err);}
        res.redirect('/');
    },
}

module.exports = controller;