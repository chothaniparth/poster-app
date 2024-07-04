const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse } = require('../common/main');
const { pool } = require('../sql/connectToDatabase');

const addMessageToAdmin = async(req, res)=>{
    try{
        const {UserId, Image, Name, Message, CGUID} = req.body
        const missingKeys = checkKeysAndRequireValues(['UserId', 'Image', 'Name', 'Message', 'CGUID'], req.body);
        if (missingKeys.length > 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is Required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_sent_message (UserId, Image, Name, Message, CGUID, IPAddress, ServerName, EntryTime) VALUES ('${UserId}', '${Image}', '${Name}', '${Message}', '${CGUID}', '${IPAddress}', '${ServerName}',  '${EntryTime}')`
        const result = await pool.query(insertQuery)
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows Updated of Message To Admin!'));
        }
        return res.status(200).send(successMessage("Data Updated Successfully!"));
    }catch(error){
        console.log('Add Message to Admin Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removeMessageToAdmin = async(req, res)=>{
    try{
        const {MessageId} = req.query
        const missingKeys = checkKeysAndRequireValues(['MessageId'], req.query)
        if(missingKeys.length > 0){
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const deleteQuery = `delete from tbl_sent_message where MessageId = ${MessageId}`;
        const result = await pool.query(deleteQuery);
        if (result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows deleted of Message To Admin!'));
        }
        return res.status(200).send(successMessage("Data deleted Successfully!"));
    }catch(error){
        console.log('Delete Message to Admin Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchMessageToAdminList = async(req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_sent_message', 'MessageId');
        res.json(result);
    }catch(error){
        console.log('Fetch Message to Admin Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    addMessageToAdmin,
    removeMessageToAdmin,
    fetchMessageToAdminList,
}