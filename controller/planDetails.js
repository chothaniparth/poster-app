const { checkKeysAndRequireValues, errorMessage, successMessage, updateUploadFiles, getCommonKeys, getAPIALLDataResponse, setSQLBooleanValue } = require('../common/main');
const { onlyStatusTrue } = require('../common/search_query');

const { pool, sql } = require('../sql/connectToDatabase');

const addPlanDetails = async (req, res)=>{
    try{
        const {Title, Status, Free, Premium} = req.body
        const fieldCheck = checkKeysAndRequireValues(['Title', 'Status', 'Free', 'Premium'], req.body)
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const insertQuery = `INSERT INTO tbl_plan_details (Title, Status, Free, Premium, IPAddress, ServerName, EntryTime) VALUES ( '${Title}', ${setSQLBooleanValue(Status)}, ${setSQLBooleanValue(Free)}, ${setSQLBooleanValue(Premium)}, '${IPAddress}', '${ServerName}', '${EntryTime}')`
        const result = await pool.query(insertQuery)
        if(result?.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows inserted of Plan'))
        }
        return res.status(200).send(successMessage('Data inserted Successfully!'))
    }catch(error){
        console.log('Add plane Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const removePlanDetails = async (req, res)=>{
    try{
        const {PlanDetailsId} = req.query
        const fieldCheck = checkKeysAndRequireValues(['PlanDetailsId'], req.query)
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }
        const deleteQuery = `delete from tbl_plan_details where PlanDetailsId = ${PlanDetailsId}`
        const result = await pool.query(deleteQuery)
        if(result?.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows deleted of Plan'))
        }
        return res.status(200).send(successMessage('Data delete Successfully!'))
    }catch(error){
        console.log('Remove plan Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const updatePlanDetails = async (req, res)=>{
    try{
        const {Title, Status, Free, Premium, PlanDetailsId} = req.body
        const fieldCheck = checkKeysAndRequireValues(['Title', 'Status', 'Free', 'Premium', 'PlanDetailsId'], req.body)
        if (fieldCheck.length !== 0) {
            return res.status(400).send(errorMessage(`${fieldCheck} is required`));
        }
        const { IPAddress, ServerName, EntryTime } = getCommonKeys();
        const updateQuery = `UPDATE tbl_plan_details SET  Title = '${Title}', Status = ${setSQLBooleanValue(Status)}, Free = ${setSQLBooleanValue(Free)}, Premium = ${setSQLBooleanValue(Premium)}, IPAddress = '${IPAddress}', ServerName = '${ServerName}', EntryTime = '${EntryTime}' WHERE PlanDetailsId = ${PlanDetailsId}`
        const result = await pool.query(updateQuery);
        if(result?.rowsAffected[0] === 0){
            return res.status(400).send(errorMessage('No rows updated of Plan'))
        }
        return res.status(200).send(successMessage('Data updated Successfully!'))
    }catch(error){
        console.log('Update plan Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchPlanListDetails = async (req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_plan_details', 'PlanDetailsId');
        res.json(result);    
    }catch(error){
        console.log('Fetch plan Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

const fetchPlanDetailsListInApp = async (req, res)=>{
    try{
        const result = await getAPIALLDataResponse(req, res, 'tbl_plan_details', 'PlanDetailsId', onlyStatusTrue);
        res.json(result);    
    }catch(error){
        console.log('Fetch plan in App Error :', error);
        return res.status(500).send(errorMessage(error?.message))
    }
}

module.exports = {
    addPlanDetails,
    updatePlanDetails,
    removePlanDetails,
    fetchPlanListDetails,
    fetchPlanDetailsListInApp
}