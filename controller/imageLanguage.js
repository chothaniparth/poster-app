const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue } = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');

const { pool, sql } = require('../sql/connectToDatabase');

const addImageLanguage = async (req, res)=>{
    try{
        const {Title, Status} = req.body
        const filedCheck = checkKeysAndRequireValues(['Title', 'Status'], req.body);
        if(filedCheck.length !== 0){
            return res.status(404).send(`${filedCheck} is required`)
        }   
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_image_language (Title, Status, IPAddress, ServerName, EntryTime) values ('${Title}', ${setSQLBooleanValue(Status)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`
        const response = await pool.query(insertQuery);
        if (response.rowsAffected[0] > 0) {
            return res.status(200).send(successMessage("Data inserted successfully!"));
        } else {
            return res.status(400).send(errorMessage('No rows inserted of Image Language!'));
        }
    }catch(error){
        console.log('add image language error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}
const updateImageLanguage = async (req, res)=>{
    try{
        const {Title, Status, ImageLanguageId} = req.body
        const filedCheck = checkKeysAndRequireValues(['Title', 'Status', 'ImageLanguageId'], req.body)
        if(filedCheck.length !== 0){
            return res.status(404).send(errorMessage(`${filedCheck} is required`))
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `update tbl_image_language set Title = '${Title}', Status = ${setSQLBooleanValue(Status)}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' where ImageLanguageId = ${ImageLanguageId}`
        const result = await pool.query(updateQuery);
        if(result.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No row updated of Image Language!'));
        }
        return res.status(200).send(successMessage('Data updated successfully!'))
    }catch(error){
        console.log('update image language error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}
const removeImageLanguage = async (req, res)=>{
    try{
        const {ImageLanguageId} = req.query
        const filedCheck = checkKeysAndRequireValues(['ImageLanguageId'], req.query);
        if(filedCheck.length !== 0){
            return res.status(404).send(errorMessage(`${filedCheck} is required`))
        }   
        const alreadyExist = [];
        const mainImageExist = await pool.query(`select Count(*) MainImageId from tbl_main_image where ImageLanguageId = ${ImageLanguageId}`);
        if(mainImageExist.recordset[0].MainImageId > 0){
            alreadyExist.push('Main Image');
        }
        if(alreadyExist.length > 0){
            return res.status(400).send(errorMessage(`Data already exist In ${alreadyExist.join(', ')}`));
        }
        const deleteQuery = `delete from tbl_image_language where ImageLanguageId = ${ImageLanguageId}`;
        const result = await pool.query(deleteQuery)
        if(result.rowsAffected[0] === 0){
            return res.status(404).send(errorMessage('No row deleted of Image Language!'))
        }
        return res.status(200).send(successMessage('Data deleted successfully!'))
    }catch(error){
        console.log('delete image language error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}
const fetchImageLanguage = async (req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_image_language', 'ImageLanguageId');
        res.json(result);
    }catch(error){
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchImageLanguageInApp = async (req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_image_language', 'ImageLanguageId', onlyStatusTrue);
        res.json(result);
    }catch(error){
        console.log('error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    addImageLanguage,
    updateImageLanguage,
    removeImageLanguage,
    fetchImageLanguage,
    fetchImageLanguageInApp
}