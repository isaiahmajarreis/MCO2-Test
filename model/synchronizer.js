const { node1, node2, node3, node_utils } = require('./nodes.js'); //path to nodes file
const transaction_utils = require('./transaction.js'); //path to transaction file

const synchronizer_utils = {
    centralsync: async function(){
        console.log("MESSAGE: Syncing central");
        let node2_log = [];
        let node3_log = [];
        let merge_log = [];

        try {
        //Sync central node with the fragments
            if(await node_utils.pingNode(1)){
                //Select the immediate id of the node_log
                var sqlQuery1 = (`SELECT MAX(id) as max_id FROM logtable_2`); 
                var sqlQuery2 = (`SELECT MAX(id) as max_id FROM logtable_3`); 
                var sqlQuery3 = (`SELECT MAX(id) as max_id FROM log_table`);

                //Do transaction with the immediate id.
                const mcentralresult_2 = await transaction_utils.queryTransaction(1, sqlQuery1); //Central Node transact with log2_table
                const mcentralresult_3 = await transaction_utils.queryTransaction(1, sqlQuery2); //Central Node transact with log3_table
                const mfragresult_2 = await transaction_utils.queryTransaction(2, sqlQuery3); //Node 2 transact with log_table
                const mfragresult_3 = await transaction_utils.queryTransaction(3, sqlQuery3); //Node 3 transact with log_table

                //Initialize Central Node Result
                if(mcentralresult_2[0].max_id === null)
                {
                    mcentralresult_2[0].max_id = 0;
                }
                if(mcentralresult_3[0].max_id === null)
                {
                    mcentralresult_3[0].max_id = 0;
                }

                //Initializing Fragment Node Result
                if(mfragresult_2[0].max_id === null)
                {
                    mfragresult_2[0].max_id = 0;
                }
                if(mfragresult_3[0].max_id === null)
                {
                    mfragresult_3[0].max_id = 0;
                }

                //Put the integer to a variable.
                let mcentral_2 = mcentralresult_2[0].max_id;
                let mcentral_3 = mcentralresult_3[0].max_id;
                let mfrag_2 = mfragresult_2[0].max_id;
                let mfrag_3 = mfragresult_3[0].max_id;

                console.log("mcentral2 " + mfrag_2);
                console.log("mcentral3 " + mfrag_3);
                console.log("mfrag2 " + mfrag_2);
                console.log("mfrag3 " + mfrag_3);

                //If the central node2 is less than fragment2
                //then central node should sync with fragment2
                if (mcentral_2 < mfrag_2)  
                {
                    var node_02_records_query = (`SELECT * FROM log_table WHERE id > ` + mcentral_2);
                    node2_log = await transaction_utils.queryTransaction(2, node_02_records_query);
                }
                //If the central node2 is greater than fragment2
                //then fragment2 should sync with the central node.
                else if (mcentral_2 > mfrag_2) 
                {
                    console.log("MESSAGE: User should sync Node 2.");
                }

                //If the central node3 is less than fragment3
                //then central node should sync with fragment3
                if (mcentral_3 < mfrag_3) {
                    var node_03_records_query = (`SELECT * FROM log_table WHERE id > ` + mcentral_3);
                    node3_log = await transaction_utils.queryTransaction(3, node_03_records_query);
                }
                //If the central node3 is greater than fragment3
                //then fragment3 should sync with the central node.
                else if (mcentral_3 > mfrag_3){
                    console.log("MESSAGE: User should sync Node 3.");
                }

                //Merge node2 and node3 to sync to central node
                merge_log = node2_log.concat(node3_log);
                merge_log.sort((a, b) => b.aTime - a.aTime);
                
                for(i = 0; i < merge_log.length; i++)
                {
                    console.log(merge_log[i]);
                    var query = "";
                    if(merge_log[i].done == "False")
                    {
                        //Check what type of action the transaction has.
                        switch (merge_log[i].action) 
                        {
                            case "INSERT": 
                            {
                                console.log("MESSAGE: Inserting sequence. CENTRAL");
                                const dateObj = new Date(merge_log[i].queuedate);

                                // Extract date components
                                const year = dateObj.getUTCFullYear();
                                const month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                                const day = ('0' + dateObj.getUTCDate()).slice(-2);
                                const hours = ('0' + dateObj.getUTCHours()).slice(-2);
                                const minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
                                const seconds = ('0' + dateObj.getUTCSeconds()).slice(-2);

                                // Create MySQL-compatible datetime string
                                const mysqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

                                if(await node_utils.pingNode(1)){
                                    const query = `INSERT INTO appointments (apptid, pxid, queuedate, hospitalname, city, regionname, type, status) VALUES ('` + merge_log[i].apptid + `', '`+ merge_log[i].pxid + `', '` + 
                                    mysqlDatetime.toString() + `', '` + merge_log[i].hospitalname  + `','` +
                                    merge_log[i].city + `', '` + merge_log[i].regionname + `', '`  + 
                                    merge_log[i].type + `', '`  + merge_log[i].status + `')`;

                                    await transaction_utils.queryTransaction(1, query);

                                    var querylast = `UPDATE log_table ` + ` SET done = 'True' WHERE id =` + centralLog[i].id;
                                    await transaction_utils.queryTransaction(1, querylast);
                                    console.log("MESSAGE: INSERTED the records to Central Node");
                                }
                                break;
                            }
                            case "DELETE": 
                            {
                                console.log("MESSAGE: Delete Sequence. CENTRAL");
                                if(await node_utils.pingNode(1)){
                                    const query = `DELETE FROM appointments WHERE apptid = ` + merge_log[i].apptid;

                                    await transaction_utils.queryTransaction(1, query);

                                    var querylast = `UPDATE log_table ` + ` SET done = 'True' WHERE id =` + centralLog[i].id;
                                    await transaction_utils.queryTransaction(1, querylast);
                                    console.log("MESSAGE: DELETED the records to Central Node");
                                }
                                break;
                            }
                            case "UPDATE" : 
                            {
                                console.log("MESSAGE: Update Sequence. CENTRAL");
                                const dateObj = new Date(merge_log[i].queuedate);

                                // Extract date components
                                const year = dateObj.getUTCFullYear();
                                const month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                                const day = ('0' + dateObj.getUTCDate()).slice(-2);
                                const hours = ('0' + dateObj.getUTCHours()).slice(-2);
                                const minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
                                const seconds = ('0' + dateObj.getUTCSeconds()).slice(-2);

                                // Create MySQL-compatible datetime string
                                const mysqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
                                if (await node_utils.pingNode(1)){
                                    const query = `UPDATE appointments SET ` +
                                        `pxid='` + merge_log[i].pxid + `',` +
                                        `queuedate='` + mysqlDatetime.toString() + `',` +
                                        `hospitalname='` + merge_log[i].hospitalname + `',` +
                                        `city='` + merge_log[i].city + `',` +
                                        `type='` + merge_log[i].type + `', ` +
                                        `status='` + merge_log[i].status + `' ` +
                                        `WHERE apptid=` + merge_log[i].apptid;

                                    await transaction_utils.queryTransaction(1, query);
                                    
                                    var querylast = `UPDATE logtable_` + nodenum + ` SET done = 'True' WHERE id =` + centralLog[i].id;
                                    await transaction_utils.queryTransaction(1, querylast);
                                    console.log("MESSAGE: UPDATED the records to Central Node");
                                }
                                break;
                            }//END CASE
                        }//ENDIF
                    }//END SWITCH
                }//END FOR
            }//END IF
                return true;
        }//END TRY
        catch (error){
            console.log("MESSAGE: FAILED? ",error);
            return false;
        }
    },

    //Sync fragments with the central node
    fragmentsync: async function (nodenum){
        console.log("MESSAGE: Syncing fragment " + nodenum);

        try{
            if(await node_utils.pingNode(1))
            {
                var sqlQuery1 = (`SELECT MAX(id) as max_id FROM logtable_` + nodenum);
                var sqlQuery2 = (`SELECT MAX(id) as max_id FROM log_table`); 

                const mcentralresult = await transaction_utils.queryTransaction(1, sqlQuery1);
                const mfragresult = await transaction_utils.queryTransaction(nodenum, sqlQuery2);

                if(mfragresult[0].max_id === null)
                {
                    mfragresult[0].max_id = 0;
                }

                const mcentral = mcentralresult[0].max_id;
                const mfrag = mfragresult[0].max_id;

                console.log("mcentralresult " + mcentralresult);
                console.log("mfragresult " + mfragresult);
                console.log("mcentral " + mcentral);
                console.log("mfrag " + mfrag);

                if(mcentral > mfrag)
                {
                    var centralQuery = `SELECT * FROM logtable_` + nodenum + ` WHERE id > ` + mfrag;
                    const centralLog = await transaction_utils.queryTransaction(1, centralQuery);

                    for(i = 0; i < mcentral - mfrag; i++)
                    {
                        switch (centralLog[i].action) 
                        {
                            case "INSERT" : {
                                console.log("MESSAGE: Insert Sequence FRAG");

                                if(await node_utils.pingNode(nodenum))
                                {
                                    const dateObj = new Date(centralLog[i].queuedate);

                                    // Extract date components
                                    const year = dateObj.getUTCFullYear();
                                    const month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                                    const day = ('0' + dateObj.getUTCDate()).slice(-2);
                                    const hours = ('0' + dateObj.getUTCHours()).slice(-2);
                                    const minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
                                    const seconds = ('0' + dateObj.getUTCSeconds()).slice(-2);
            
                                    // Create MySQL-compatible datetime string
                                    const mysqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                                    console.log("date time " + mysqlDatetime);
                                    
                                    const query = `INSERT INTO appointments (apptid, pxid, queuedate, hospitalname, city, regionname, type, status) VALUES ('`+ centralLog[i].apptid + `', '` + 
                                                    centralLog[i].pxid + `', '` + mysqlDatetime.toString() + `', '` + centralLog[i].hospitalname  + `','` + 
                                                    centralLog[i].city + `', '` + centralLog[i].regionname + `', '` + centralLog[i].type + `', '`  + centralLog[i].status +  `')`;
                                    
                                    console.log("query " + query + " " + nodenum);
                                    
                                    await transaction_utils.queryTransaction(nodenum, query);
                                    var querylast = `UPDATE logtable_` + nodenum + ` SET done = 'True' WHERE id =` + centralLog[i].id;
                                    await transaction_utils.queryTransaction(1, querylast);
                                    console.log("MESSAGE: INSERTED records to Fragment.");
                                }//ENDIF
                                break;
                            }
                            case "DELETE" : {
                                console.log("MESSAGE: Delete Sequence FRAG");

                                if(await node_utils.pingNode(nodenum))
                                {
                                    const query = `DELETE FROM appointments WHERE apptid = ` + centralLog[i].apptid;
                                    await transaction_utils.queryTransaction(nodenum, query);

                                    var querylast = `UPDATE logtable_` + nodenum + ` SET done = 'True' WHERE id =` + centralLog[i].id;
                                    await transaction_utils.queryTransaction(1, querylast);
                                    console.log("MESSAGE: DELETED records to Fragment.");
                                }//ENDIF
                                break;
                            }
                            case "UPDATE" : {
                                console.log("MESSAGE: Update Sequence Frag");

                                if (await node_utils.pingNode(nodenum))
                                {
                                    const dateObj = new Date(centralLog[i].queuedate);

                                    // Extract date components
                                    const year = dateObj.getUTCFullYear();
                                    const month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                                    const day = ('0' + dateObj.getUTCDate()).slice(-2);
                                    const hours = ('0' + dateObj.getUTCHours()).slice(-2);
                                    const minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
                                    const seconds = ('0' + dateObj.getUTCSeconds()).slice(-2);
            
                                    // Create MySQL-compatible datetime string
                                    const mysqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

                                    const query = `UPDATE appointments SET ` +
                                    `pxid='` + centralLog[i].pxid + `',` +
                                    `queuedate='` + mysqlDatetime.toString() + `',` +
                                    `hospitalname='` + centralLog[i].hospitalname + `',` +
                                    `city='` + centralLog[i].city + `',` +
                                    `type='` + centralLog[i].type + `', ` +
                                    `status='` + centralLog[i].status + `' ` +
                                    `WHERE apptid=` + centralLog[i].apptid;
            
                                    await transaction_utils.queryTransaction(nodenum, query);

                                    var querylast = `UPDATE logtable_` + nodenum + ` SET done = 'True' WHERE id =` + centralLog[i].id;
                                    await transaction_utils.queryTransaction(1, querylast);
                                    console.log("MESSAGE: UPDATED records from Fragment.");
                                }
                                break;
                            }//ENDCASEUPDATE
                            
                        
                        }//ENDSWITCH
                    }//ENDFOR
                }//ENDIF
                else if(mcentral < mfrag)
                {
                    console.log("MESSAGE: Sync Central Node.");
                }//ENDELSEIF
            }//ENDIF
                return true;
        }//END TRY
        catch(error){
            console.log("MESSAGE: FAILED? ",error);
            return false;
        } 

    },
}

module.exports = synchronizer_utils;