const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue } = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');

const addUserCategory = async (req, res)=>{
    try{
        const {Title, Status} = req.body
        const filedCheck = checkKeysAndRequireValues(['Title', 'Status'], req.body);
        if(filedCheck.length !== 0){
            return res.status(404).send(errorMessage(`${filedCheck} is required`))
        }   
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_user_category (Title, Status, IPAddress, ServerName, EntryTime) values ('${Title}', ${setSQLBooleanValue(Status)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`
        const response = await pool.query(insertQuery);
        if (response.rowsAffected[0] === 0) {
            return res.status(400).send(errorMessage('No rows inserted of User Category!'));
        }
        return res.status(200).send(successMessage("Data inserted successfully!"));
    }catch(error){
        console.log('add user category error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const updateUserCategory = async (req, res)=>{
    try{
        const {Title, Status, UserCategoryId} = req.body
        const filedCheck = checkKeysAndRequireValues(['Title', 'Status', 'UserCategoryId'], req.body)
        if(filedCheck.length !== 0){
            return res.status(404).send(errorMessage(`${filedCheck} is required`))
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `update tbl_user_category set Title = '${Title}', Status = ${setSQLBooleanValue(Status)}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' where UserCategoryId = ${UserCategoryId}`
        const result = await pool.query(updateQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No row updated of User Category!'));
        }
        return res.status(200).send(successMessage('Data updated successfully!'))
    }catch(error){
        console.log('update user category error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removeUserCategory = async (req, res)=>{
    try{
        const {UserCategoryId} = req.query
        const filedCheck = checkKeysAndRequireValues(['UserCategoryId'], req.query);
        if(filedCheck.length !== 0){
            return res.status(404).send(`${filedCheck} is required`)
        }   
        const deleteQuery = `delete from tbl_user_category where UserCategoryId = ${UserCategoryId}`;
        const result = await pool.query(deleteQuery)
        if(result.rowsAffected[0] === 0){
            return res.status(404).send(errorMessage('No row deleted of User Category!'))
        }
        return res.status(200).send(successMessage('Data deleted successfully!'))
    }catch(error){
        console.log('delete user category error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchUserCategory = async(req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_user_category', 'UserCategoryId');
        res.json(result);    
    }catch(error){
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}   
const fetchUserCategoryInApp = async(req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_user_category', 'UserCategoryId', onlyStatusTrue);
        res.json(result);    
    }catch(error){
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}   

module.exports = {
    addUserCategory,
    fetchUserCategoryInApp,
    updateUserCategory,
    removeUserCategory,
    fetchUserCategory
}