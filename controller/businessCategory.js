const { checkKeysAndRequireValues, errorMessage, successMessage, getCommonKeys, getAPIALLDataResponse, setSQLOrderId, getCommonAPIResponse } = require('../common/main');
const {setSQLBooleanValue} = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');
const { pool, sql } = require('../sql/connectToDatabase');

const fetchBusinessCategoryList = async (req, res) => {
    try {
        const { Status } = req.query;
        let status = '';
        if (Status === 'true') {
            status = 'WHERE Status = 1';
        }
        const getMainImage = {
            getQuery: `SELECT * FROM tbl_business_category ${status} ORDER BY CASE WHEN OrderId IS NULL THEN 1 ELSE 0 END, OrderId ASC, BusinessCategoryId DESC`,
            countQuery: `SELECT COUNT(*) AS totalCount FROM tbl_business_category ${status}`,
        };
        const result = await getCommonAPIResponse(req, res, getMainImage);
        res.json(result);
    } catch (error) {
        res.status(500).send(errorMessage(error?.message));
    }
}

const addBusinessCategoryList = async (req, res) => {
    try {
        const { Title, Status, OrderId = null} = req.body;
        const fieldCheck = await checkKeysAndRequireValues(['Title', 'Status'], req.body)
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_business_category (Title, Status, OrderId, IPAddress, ServerName, EntryTime) VALUES ('${Title}', '${setSQLBooleanValue(Status)}', ${setSQLOrderId(OrderId)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`;
        const response = await pool.query(insertQuery);
        if (response.rowsAffected && response.rowsAffected[0] > 0) {
            return res.status(201).send(successMessage('Business Category Created Successfully'));
        }
        return res.status(500).send(errorMessage('Failed to Insert new Business Category'));
    } catch (error) {
        console.log("insert Business Category Error:", error);
        return res.status(500).send(errorMessage(error?.message));
    }
};

const updateBusinessCategoryById = async (req, res)=>{
    try{
        const { BusinessCategoryId, Title, Status, OrderId} = req.body;
        const missingKeys = checkKeysAndRequireValues(['BusinessCategoryId', 'Title', 'Status'], req.body)
        if (missingKeys.length !== 0) {
            return res.status(400).send(errorMessage(`${missingKeys} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_business_category SET Title = '${Title}', Status = ${setSQLBooleanValue(Status)}, OrderId = ${setSQLOrderId(OrderId)}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' WHERE BusinessCategoryId = ${BusinessCategoryId}`
        const result = await pool.query(updateQuery);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return res.status(201).send(successMessage('Data Updated successfully'));
        }
        return res.status(500).send(errorMessage('No row updated of Business Category'));
    }catch(error){
        console.log("error:", error);
        return res.status(500).send(errorMessage(error?.message));
    }
}
const removeBusinessCategory = async (req, res)=>{
    try{
        const {BusinessCategoryId} = req.query
        const fieldCheck = checkKeysAndRequireValues(['BusinessCategoryId'], req.query)
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }
        const deleteQuery = `DELETE FROM tbl_business_category WHERE BusinessCategoryId = ${BusinessCategoryId}`
        const result = await pool.request().query(deleteQuery)
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            return res.status(201).send(successMessage('Deleted Data Successfully'));
        }
        return res.status(500).send(errorMessage('No row deleted of Business Category'));
    }catch(error){
        console.log("error:", error);
        return res.status(500).send(errorMessage(error?.message));
    }
}

module.exports = {
    fetchBusinessCategoryList,
    addBusinessCategoryList,
    updateBusinessCategoryById,
    removeBusinessCategory,
}