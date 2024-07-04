const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');


const fetchNotificationUser = async (req, res) => {
    try {
        const result = await getAPIALLDataResponse(req, res, 'tbl_notification_user', 'NotificationUserId');
        res.json(result);
    } catch (error) {
        return res.status(500).send(errorMessage(error?.message));
    }
}
const addNotificationUser = (req, res)=>{
    try{
        const {
            UserId
            ,NotificationId
        } = req.body
        const missingKeys = checkKeysAndRequireValues(['UserId' ,'NotificationId'], req.body)
        if (missingKeys.length !== 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_notification_user (UserId ,NotificationId, IPAddress, ServerName, EntryTime) values (${UserId} ,${NotificationId}, '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const result = pool.request().query(insertQuery);
        if (result.rowsAffected && result.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No row Inserted in Notification User'));
        }
        return res.status(200).send(successMessage('Data Inserted successfully'));
    }catch(error){
        console.log('Add notification user Error :', error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    addNotificationUser,
    fetchNotificationUser
}