const { node1, node2, node3, node_utils } = require('./nodes.js'); //path to nodes file

const transaction_utils = {
    queryTransaction: async function (node, sqlQuery) {
        let connection;
        try {
            connection = await node_utils.getConnection(parseInt(node));
            
            //SET isolation level
            await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

            await connection.beginTransaction();
            console.log("MESSAGE: Begin transaction! " + sqlQuery);

            var [result, fields] =  await connection.query(sqlQuery);

            await connection.commit();
            console.log('MESSAGE: Successful Connection and Transaction! Node: ' + node);
            return result;
        } catch (error) {
            if (connection) 
            {
                await connection.rollback();
            }
            throw error;
        } finally {
            if (connection) 
            {
                await connection.release();
            }
        }
    },

}

module.exports = transaction_utils;